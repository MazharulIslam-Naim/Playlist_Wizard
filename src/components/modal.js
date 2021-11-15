import React, { Component } from 'react';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  paper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxHeight: "100vh"
  },
  modalBody: {
    margin: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  modalHeader: {
    textAlign: "center"
  },
  switchesContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end"
  },
  publicSwitchContainer: {
    display: "flex",
    alignItems: "center",
    marginRight: "40px"
  },
  switchLabels: {
    color: "black",
    width: "auto"
  },
  collaborativeWarning: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    color: "red",
  },
  rootTableContainer: {
    maxHeight: "70vh"
  },
  rootTableRow: {
    borderBottom: "1px solid #e6e6e6",
    "&$hover:hover": {
      backgroundColor: "#ffe6f2",
    },
  },
  hover: {
    "&:hover": {
      backgroundColor: "#ffe6f2",
    },
  },
  titleCell: {
    display: "flex",
    flexDirection: "row"
  },
  songTitle: {
    margin: "auto 0 auto 16px"
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px"
  },
  success: {
    backgroundColor: "#4fe383",
    marginRight: "10px",
    '&:hover': {
      backgroundColor: "#38e073",
    },
  },
  delete: {
    backgroundColor: "#ff6666",
    marginRight: "10px",
    '&:hover': {
      backgroundColor: "#ff4d4d",
    },
  }
});

class PlaylistModel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      description: "",
      newPlaylistId: "",
      playlistItems: [],
      public: false,
      collaborative: false,
      selected: []
    }
  }

  // If the name, description, public, or collaborative status of the playlist that is sent changes then update.
  componentDidUpdate(prevProps) {
    if (this.props.modalInfo.name !== prevProps.modalInfo.name ||
        this.props.modalInfo.description !== prevProps.modalInfo.description ||
        this.props.modalInfo.public !== prevProps.modalInfo.public ||
        this.props.modalInfo.collaborative !== prevProps.modalInfo.collaborative
      ) {
      this.setState({
        name: this.props.modalInfo.name,
        description: this.props.modalInfo.description,
        public: this.props.modalInfo.public,
        collaborative: this.props.modalInfo.collaborative,
       })
    }
    if (!(prevProps.modalInfo.songs) && this.props.modalInfo.songs) {
      this.setState({ selected: this.props.modalInfo.songs })
    }
  }

  // Request to create a new playlist.
  createPlaylist = () => {
    axios.post('/playlist/new', {access_token: this.props.accessToken, user_id: this.props.modalInfo.userId, name: this.state.name})
      .then(res => {
        this.setState({ newPlaylistId: res.data.id })
        if (this.props.modalInfo.modalType  == "New") {
          this.props.updatePlaylists(true)
          this.props.closeModal()
        }
        if (this.props.modalInfo.modalType  == "Duplicate") {
          this.editInfoPlaylist()
        }
      })
      .catch(error => console.log(error))
  }

  // Duplicates the selected playlist.
  duplicatePlaylist = () => {
    this.createPlaylist()
    this.setState({ playlistItems: [] })
    if (this.props.modalInfo.uri) {
      this.getPlaylistItems(0)
    }
    else {
      this.getSavedItems(0)
    }
  }

  // Get the current user's saved songs.
  getSavedItems(offset) {
    axios.get('/playlist/saved_items', {params: {access_token: this.props.accessToken, offset: offset} })
      .then(res => {
        res.data.items.forEach((item, i) => {
          this.setState(previousState => ({
            playlistItems: [...previousState.playlistItems, item.track.uri]
          }))
        })
        if (res.data.next) {
          this.getSavedItems(offset + 50)
        }
        else {
          this.addToPlaylist(0)
        }
      })
      .catch(error => console.log(error))
  }

  // Gets all the songs in the current playlist and saves only the uri of each song.
  getPlaylistItems(offset) {
    axios.get('/playlist/playlist_items',
      {params: {access_token: this.props.accessToken, playlist_id: this.props.modalInfo.id, offset: offset}}
    )
      .then(res => {
        res.data.items.forEach((item, i) => {
          this.setState(previousState => ({
            playlistItems: [...previousState.playlistItems, item.track.uri]
          }))
        })
        if (res.data.next) {
          this.getPlaylistItems(offset + 100)
        }
        else {
          this.addToPlaylist(0)
        }
      })
      .catch(error => console.log(error))
  }

  // Request to add all the songs from the ones saved in state to the selected playlist.
  addToPlaylist(offset) {
    if (this.state.playlistItems.length > 0) {
      if (this.state.playlistItems.length - offset <= 100) {
        axios.post('/playlist/add',
        {access_token: this.props.accessToken,
        playlist_id: this.state.newPlaylistId,
        songs: this.state.playlistItems.slice(offset) })
          .then(() => {
            this.props.updatePlaylists(true)
            this.props.closeModal()
          })
          .catch(error => console.log(error))
      }
      else {
        axios.post('/playlist/add',
        {access_token: this.props.accessToken,
        playlist_id: this.state.newPlaylistId,
        songs: this.state.playlistItems.slice(offset, offset + 100) })
          .then(() => this.addToPlaylist(offset + 100))
          .catch(error => console.log(error))
      }
    }
    else {
      this.props.updatePlaylists(true)
      this.props.closeModal()
    }
  }

  // Request to edit the info of a playlist.
  editInfoPlaylist = () => {
    axios.put('/playlist/edit', {
      access_token: this.props.accessToken,
      playlist_id: this.props.modalInfo.modalType  == "EditInfo" ? this.props.modalInfo.id : this.state.newPlaylistId,
      name: this.state.name,
      description: this.state.description,
      public: this.state.public,
      collaborative: this.state.collaborative
    })
      .then(() => {
        if (this.props.modalInfo.modalType  == "EditInfo") {
          this.props.updatePlaylists(false)
          this.props.closeModal()
        }
      })
      .catch(error => console.log(error))
  }

  // Request to delete a playlist.
  deletePlaylist = () => {
    axios.delete('/playlist/delete', {params: {access_token: this.props.accessToken, playlist_id: this.props.modalInfo.id}})
      .then(() => {
        this.props.updatePlaylists(true)
        this.props.closeModal()
      })
      .catch(error => console.log(error))
  }

  // Change the public button slider.
  changePublicStatus = () => {
    if (!this.state.public) {
      this.setState({ collaborative: false })
    }
    this.setState({ public: !this.state.public })
  }

  // Change the collaborative button slider.
  changeCollaborativeStatus = () => {
    if (!this.state.public) {
      this.setState({ collaborative: !this.state.collaborative })
      return
    }
    this.setState({ collaborative: false })
  }

  // Get a list of the uris or ids of the songs that are selected to be deleted from the current playlist or the user's saved songs.
  getSelectedUris = () => {
    if (this.props.modalInfo.uri) {
      let songUris = this.state.selected.map((item, i) => {
        return item.track.uri
      })
      this.deleteSongs(songUris, 0)
    }
    else {
      let songIds = this.state.selected.map((item, i) => {
        return item.track.id
      })
      this.deleteSavedSongs(songIds, 0)
    }
  }

  // Request to delete certain songs from the current playlist.
  deleteSongs(uris, offset) {
    if (uris.length > 0) {
      if (uris.length - offset <= 100) {
        axios.delete('/playlist/playlist_items',
        {params: {access_token: this.props.accessToken,
        playlist_id: this.props.modalInfo.id,
        songs: uris.slice(offset) }})
          .then(() => {
            this.props.updatePlaylists(false)
            this.props.updatePlaylistSongs()
            this.props.closeModal()
          })
          .catch(error => console.log(error))
      }
      else {
        axios.delete('/playlist/playlist_items',
        {params: {access_token: this.props.accessToken,
        playlist_id: this.props.modalInfo.id,
        songs: uris.slice(offset, offset + 100) }})
          .then(() => this.deleteSongs(uris, offset + 100))
          .catch(error => console.log(error))
      }
    }
    else {
      this.props.updatePlaylists(false)
      this.props.closeModal()
    }
  }

  // Request to delete the selected songs from the user's saved songs.
  deleteSavedSongs(ids, offset) {
    if (ids.length > 0) {
      if (ids.length - offset <= 50) {
        axios.delete('/playlist/saved_items',
        {params: {access_token: this.props.accessToken,
        songs: ids.slice(offset) }})
          .then(() => {
            this.props.updatePlaylistSongs()
            this.props.closeModal()
          })
          .catch(error => console.log(error))
      }
      else {
        axios.delete('/playlist/saved_items',
        {params: {access_token: this.props.accessToken,
        songs: ids.slice(offset, offset + 50) }})
          .then(() => this.deleteSavedSongs(ids, offset + 50))
          .catch(error => console.log(error))
      }
    }
    else {
      this.props.updatePlaylists(false)
      this.props.closeModal()
    }
  }

  // New playlist modal body.
  newPLBody() {
    const { classes } = this.props;

    return (
      <Modal open={this.props.open} onClose={() => this.props.closeModal()}>
        <Paper className={classes.paper}>
          <div className={classes.modalBody}>
            <h2 className={classes.modalHeader}>Give the new playlist a title:</h2>
            <TextField
              required
              label="Name"
              defaultValue={this.state.name}
              onChange={e => this.setState({ name: e.target.value })}
            />
            <div className={classes.buttons}>
              <Button
                variant="contained"
                disabled={this.state.name == ""}
                onClick={() => this.createPlaylist()}
                classes={{root: classes.success}}
              >
                Create
              </Button>
              <Button variant="contained" onClick={() => this.props.closeModal()}>Cancel</Button>
            </div>
          </div>
        </Paper>
      </Modal>
    )
  }

  // duplicate playlist modal body.
  duplicatePLBody() {
    const { classes } = this.props;

    return (
      <Modal open={this.props.open} onClose={() => this.props.closeModal()}>
        <Paper className={classes.paper}>
          <div className={classes.modalBody}>
            <h2 className={classes.modalHeader}>Please change the duplicate playlist's info to your specifications:</h2>
            <TextField
              required
              label="Name"
              defaultValue={this.state.name}
              onChange={e => this.setState({ name: e.target.value })}
            />
            <TextField
              label="Description"
              defaultValue={this.state.description}
              onChange={e => this.setState({ description: e.target.value })}
            />
            <div className={classes.switchesContainer}>
              <div className={classes.publicSwitchContainer}>
                <Typography variant="body2" gutterBottom className={classes.switchLabels}>
                  Private
                </Typography>
                <Switch
                  checked={this.state.public}
                  onChange={() => this.changePublicStatus()}
                  color="primary"
                  name="Public"
                  inputProps={{ 'aria-label': 'Public checkbox' }}
                />
                <Typography variant="body2" gutterBottom className={classes.switchLabels}>
                  Public
                </Typography>
              </div>
              <div>
                <Typography variant="body2" gutterBottom className={classes.switchLabels}>
                  Collaborative
                </Typography>
                <Switch
                  checked={this.state.collaborative}
                  onChange={() => this.changeCollaborativeStatus()}
                  color="primary"
                  name="Collaborative"
                  inputProps={{ 'aria-label': 'Collaborative checkbox' }}
                />
              </div>
            </div>
            <Typography variant="body2" gutterBottom className={classes.collaborativeWarning}>
              Only private playlists can be collaborative.
            </Typography>
            <div className={classes.buttons}>
              <Button
                variant="contained"
                disabled={this.state.name == ""}
                onClick={() => this.duplicatePlaylist()}
                classes={{root: classes.success}}
              >
                Duplicate
              </Button>
              <Button variant="contained" onClick={() => this.props.closeModal()}>Cancel</Button>
            </div>
          </div>
        </Paper>
      </Modal>
    )
  }

  // Edit playlist info modal body.
  editInfoPLBody() {
    const { classes } = this.props;

    return (
      <Modal open={this.props.open} onClose={() => this.props.closeModal()}>
        <Paper className={classes.paper}>
          <div className={classes.modalBody}>
            <h2 className={classes.modalHeader}>Edit the details of the playlist <u>{this.props.modalInfo.name}</u>:</h2>
            <TextField
              required
              label="Name"
              defaultValue={this.state.name}
              onChange={e => this.setState({ name: e.target.value })}
            />
            <TextField
              required={this.props.modalInfo.description ? true : false}
              label="Description"
              defaultValue={this.state.description}
              onChange={e => this.setState({ description: e.target.value })}
            />
            <div className={classes.switchesContainer}>
              <div className={classes.publicSwitchContainer}>
                <Typography variant="body2" gutterBottom className={classes.switchLabels}>
                  Private
                </Typography>
                <Switch
                  checked={this.state.public}
                  onChange={() => this.changePublicStatus()}
                  color="primary"
                  name="Public"
                  inputProps={{ 'aria-label': 'Public checkbox' }}
                />
                <Typography variant="body2" gutterBottom className={classes.switchLabels}>
                  Public
                </Typography>
              </div>
              <div>
                <Typography variant="body2" gutterBottom className={classes.switchLabels}>
                  Collaborative
                </Typography>
                <Switch
                  checked={this.state.collaborative}
                  onChange={() => this.changeCollaborativeStatus()}
                  color="primary"
                  name="Collaborative"
                  inputProps={{ 'aria-label': 'Collaborative checkbox' }}
                />
              </div>
            </div>
            <Typography variant="body2" gutterBottom className={classes.collaborativeWarning}>
              Only private playlists can be collaborative.
            </Typography>
            <div className={classes.buttons}>
              <Button
                variant="contained"
                disabled={this.state.name == "" || (this.props.modalInfo.description ? !this.state.description : false)}
                onClick={() => this.editInfoPlaylist()}
                classes={{root: classes.success}}
              >
                Edit Info
              </Button>
              <Button variant="contained" onClick={() => this.props.closeModal()}>Cancel</Button>
            </div>
          </div>
        </Paper>
      </Modal>
    )
  }

  // Delete playlist modal body.
  deletePLBody() {
    const { classes } = this.props;

    return (
      <Modal open={this.props.open} onClose={() => this.props.closeModal()}>
        <Paper className={classes.paper}>
          <div className={classes.modalBody}>
            {this.props.modalInfo.uri ?
              <h2 className={classes.modalHeader}>Are you sure you want to delete the playlist: <u>{this.props.modalInfo.name}</u>?</h2>
            :
              <h2 className={classes.modalHeader}>Are you sure you want to delete all of your liked songs?</h2>
            }
            <div className={classes.buttons}>
              <Button
                variant="contained"
                onClick={() => {
                  if (this.props.modalInfo.uri) {this.deletePlaylist()}
                  else {this.getSelectedUris()}
                }}
                classes={{root: classes.delete}}
              >
                Delete
              </Button>
              <Button variant="contained" onClick={() => this.props.closeModal()}>Cancel</Button>
            </div>
          </div>
        </Paper>
      </Modal>
    )
  }

  // Function to select all the songs in the playlist
  handleSelectAllClick = (event) => {
    this.setState({ selected: [] })
    if (event.target.checked) {
      this.setState({ selected: this.props.modalInfo.songs })
    }
  }

  // Function to see if a song is selected or not
  isSelected = (uri) => this.state.selected.findIndex(selected => selected.track.uri == uri)

  // Handle clicking on one of the songs
  handleClick = (event, song) => {
    const checkedIndex = this.isSelected(song.track.uri)
    let newChecked = [];

    if (checkedIndex === -1) {
      newChecked = newChecked.concat(this.state.selected, song);
    } else if (checkedIndex === 0) {
      newChecked = newChecked.concat(this.state.selected.slice(1));
    } else if (checkedIndex === this.state.selected.length - 1) {
      newChecked = newChecked.concat(this.state.selected.slice(0, -1));
    } else if (checkedIndex > 0) {
      newChecked = newChecked.concat(
        this.state.selected.slice(0, checkedIndex),
        this.state.selected.slice(checkedIndex + 1),
      );
    }

    this.setState({ selected: newChecked })
  }

  // Read spotify's timestamp in to string.
  timestampToString(timestamp) {
    var date = new Date(Date.parse(timestamp))
    var minutes = "0" + date.getMinutes()
    var seconds = "0" + date.getSeconds()
    var hours = date.getHours() % 12 == 0 ? 12 : date.getHours() % 12
    var timeOfDay = date.getHours() < 12 ? "AM" : "PM"
    return (
      (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " +
      hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + timeOfDay
    )
  }

  // Delete selected songs from playlist modal body.
  deleteSongsPLBody() {
    const { classes } = this.props;
    // Array of objects of the column headers
    const headCells = [
      { id: 'Id', numeric: true, disablePadding: false, label: '#' },
      { id: 'Title', numeric: false, disablePadding: false, label: 'TITLE' },
      { id: 'Album', numeric: false, disablePadding: false, label: 'ALBUM' },
      { id: 'Artist', numeric: false, disablePadding: false, label: 'ARTIST' },
      { id: 'Length', numeric: true, disablePadding: false, label: 'LENGTH' },
      { id: 'Date Added', numeric: false, disablePadding: false, label: 'DATE ADDED' },
    ];

    return (
      <Modal open={this.props.open} onClose={() => this.props.closeModal()}>
        <Paper className={classes.paper}>
          <div className={classes.modalBody}>
            <h2 className={classes.modalHeader}>These songs will be deleted from the playlist <u>{this.props.modalInfo.name}</u>:</h2>
            <TableContainer classes={{root: classes.rootTableContainer}}>
              <Table stickyHeader size='medium'>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={0 < this.state.selected.length && this.state.selected.length < this.props.modalInfo.songs.length}
                        checked={this.state.selected.length == this.props.modalInfo.songs.length}
                        onChange={event => this.handleSelectAllClick(event)}
                      />
                    </TableCell>
                    {headCells.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'default'}
                      >
                        {headCell.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.props.modalInfo.songs.map((row, index) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        key={row.track.id}
                        selected={this.isSelected(row.track.uri) != -1}
                        onClick={event => this.handleClick(event, row)}
                        classes={{root: classes.rootTableRow, hover: classes.hover}}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={this.isSelected(row.track.uri) != -1}/>
                        </TableCell>
                        <TableCell align="right">{index+1}</TableCell>
                        <TableCell>
                          <div className={classes.titleCell}>
                            <Avatar variant='square' alt={row.track.album.name} src={row.track.album.images[row.track.album.images.length - 1].url} />
                            <div className={classes.songTitle}>
                              {row.track.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{row.track.album.name}</TableCell>
                        <TableCell>
                          {
                            row.track.artists.map(artist => {
                              return (
                                artist.name
                              )
                            }).join(", ")
                          }
                        </TableCell>
                        <TableCell align="right">
                          {Math.floor(row.track.duration_ms / 60000) + ":" + ("0" + Math.floor((row.track.duration_ms % 60000) / 1000)).substr(-2)}
                        </TableCell>
                        <TableCell>{this.timestampToString(row.added_at)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <div className={classes.buttons}>
              <Button
                variant="contained"
                disabled={this.state.selected.length == 0}
                onClick={() => this.getSelectedUris()}
                classes={{root: classes.delete}}
              >
                Delete Songs
              </Button>
              <Button variant="contained" onClick={() => this.props.closeModal()}>Cancel</Button>
            </div>
          </div>
        </Paper>
      </Modal>
    )
  }

  render() {
    const { classes } = this.props;

    switch(this.props.modalInfo.modalType) {
      case "New":
        return this.newPLBody()
        break;
      case "Duplicate":
        return this.duplicatePLBody()
        break;
      case "EditInfo":
        return this.editInfoPLBody()
        break;
      case "Delete":
        return this.deletePLBody()
        break;
      case "DeleteSongs":
        return this.deleteSongsPLBody()
        break;
      default:
        return <div/>
    }
  }
}

export default withStyles(styles)(PlaylistModel);
