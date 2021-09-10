import React, { Component } from 'react';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';

import PlaylistModel from './modal';

const styles = theme => ({
  paper: {
    backgroundColor: "transparent",
    marginLeft: "180px",
    height: "100vh"
  },
  noSongs: {
    backgroundColor: "transparent",
    color: "white",
    height: "100vh",
    margin: "0 0 0 180px",
    display: "flex",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  infoPaper: {
    backgroundColor: "#16191d",
    minHeight: "200px",
    height: "20%",
    color: "white",
    display: "flex",
    alignContent: "center",
    alignItems: "center",
  },
  playlistImage: {
    height: "150px",
    width: "150px",
    margin: "0px 30px",
  },
  likedSongsImage: {
    backgroundColor: "#1db954",
    height: "150px",
    width: "150px",
    margin: "0px 30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: {
    height: "4em",
    width: "4em",
  },
  playlistInfo: {
    fontWeight: "bold"
  },
  infoPC: {
    display: "flex"
  },
  dotPC: {
    fontSize: "0.6rem",
    margin: "0px 3px",
    fill: "#1db954"
  },
  playlistTitle: {
    "&:hover": {
      cursor: "pointer"
    }
  },
  dot: {
    fill: "#1db954",
    width: "0.5em",
    height: "0.5em",
    margin: "0px 5px"
  },
  rootTableContainer: {
    height: "100%"
  },
  headerColor: {
    backgroundColor: "#21252b",
    color: "white",
    borderBottom: "1px solid rgba(255, 255, 255, 0.25)"
  },

  rootSortLabel: {
    "&:focus": {
      color: "white"
    },
    "&:hover": {
      color: "white",
      "& .icon": {
        color: "white"
      }
    },
    "&$active": {
      color: "white",
      "&& $icon": {
        color: "white",
      },
    },
  },
  active: {
    color: "white",
  },
  icon: {
    color: "white",
  },

  rootTableRow: {
    "&$hover:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    "&$selected, &$selected:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.35)",
    },
  },
  hover: {
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
  selected: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },

  tableCell: {
    color: "white",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
  },

  colorSecondaryCheckbox: {
    "&:hover": {
      backgroundColor: "#d5d5d5",
    },
    "&$checked": {
      color: "white",
      "&:hover": {
        backgroundColor: "#d5d5d5",
      },
    },
  },
  checked: {

  },
  titleCell: {
    display: "flex",
    flexDirection: "row"
  },
  songTitle: {
    margin: "auto 0 auto 16px"
  }
});

// Array of objects of the column headers
const headCells = [
  { id: 'Id', numeric: true, disablePadding: false, label: '#' },
  { id: 'Title', numeric: false, disablePadding: false, label: 'TITLE' },
  { id: 'Album', numeric: false, disablePadding: false, label: 'ALBUM' },
  { id: 'Artist', numeric: false, disablePadding: false, label: 'ARTIST' },
  { id: 'Length', numeric: true, disablePadding: false, label: 'LENGTH' },
  { id: 'Date Added', numeric: false, disablePadding: true, label: 'DATE ADDED' },
];

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlistItems: [],
      playlistItemUris: [],
      orderBy: 'Id',
      order: 'asc',
      checked: [],
      showModal: false,
      modalInfo: {},
    }
  }

  // If the playlist seleceted changes then update
  componentDidUpdate(prevProps) {
    if (this.props.playlistId !== prevProps.playlistId) {
      this.setState({
        playlistItems: [],
        orderBy: 'Id',
        order: 'asc',
        checked: [],
        showModal: false,
        modalInfo: {}
      })
      if (this.props.playlistId == "Liked Songs") {
        this.getSavedItems(0)
      }
      else {
        this.getPlaylistItems(0)

      }
    }
  }

  // Request to get all the songs of the selected palylist
  getPlaylistItems(offset) {
    axios.get('http://localhost:5000/playlist/playlist_items', {params: {access_token: this.props.userToken, playlist_id: this.props.playlistId, offset: offset}})
      .then(res => {
        this.setState(previousState => ({
          playlistItems: previousState.playlistItems.concat(res.data.items)
        }))
        if (res.data.next) {
          this.getPlaylistItems(offset + 100)
        }
      })
      .catch(error => console.log(error))
  }

  // Request to get all of the user's saved songs
  getSavedItems(offset) {
    axios.get('http://localhost:5000/playlist/saved_items', {params: {access_token: this.props.userToken, offset: offset} })
      .then(res => {
        this.setState(previousState => ({
          playlistItems: previousState.playlistItems.concat(res.data.items)
        }))
        if (res.data.next) {
          this.getSavedItems(offset + 50)
        }
      })
      .catch(error => console.log(error))
  }

  // Sort the songs based on the column header that is clicked
  sortSongs = (id) => {
    var newDirection = this.state.orderBy != id ? 'asc' : this.state.order == 'asc' ? 'desc' : 'asc'
    this.setState({ playlistItemUris: [], orderBy: id, order: newDirection })

    switch(id) {
      case 'Id':
        this.setState({ playlistItems: this.state.playlistItems.reverse() })
        break;
      case 'Title':
        this.state.playlistItems.sort(
          function(a, b) {
            return a.track.name.localeCompare(b.track.name)
          }
        )
        break;
      case 'Album':
        this.state.playlistItems.sort(
          function(a, b) {
            return a.track.album.name.localeCompare(b.track.album.name)
          }
        )
        break;
      case 'Artist':
        this.state.playlistItems.sort(
          function(a, b) {
            if (a.track.artists[0].name.localeCompare(b.track.artists[0].name) == 0) {
              if (a.track.artists.length - b.track.artists.length == 0) {
                for (var i = 1; i < a.track.artists.length; i++) {
                  if (a.track.artists[i].name.localeCompare(b.track.artists[i].name) == 0) {
                    continue
                  }
                  return a.track.artists[i].name.localeCompare(b.track.artists[i].name)
                  console.log("hello")
                }
              }
              return a.track.artists.length - b.track.artists.length
            }
            return a.track.artists[0].name.localeCompare(b.track.artists[0].name)
          }
        )
        break;
      case 'Duration':
        this.state.playlistItems.sort(
          function(a, b) {
            return a.track.duration_ms - b.track.duration_ms
          }
        )
        break;
      case 'Date Added':
        this.state.playlistItems.sort(
          function(a, b) {
            var aDate = new Date(Date.parse(a.added_at))
            var bDate = new Date(Date.parse(b.added_at))

            if (aDate > bDate) {
              return 1
            } else if (aDate < bDate){
              return -1
            } else {
              return 0
            }
          }
        )
        break;
    }

    if (newDirection == 'desc' && id != 'Id') {
      this.setState({ playlistItems: this.state.playlistItems.reverse() })
    }

    this.reorderPlaylistItems()
      .then(() => this.addToPlaylist(0))
  }

  // Get all the uris of the new sorted list of songs
  async reorderPlaylistItems () {
    this.state.playlistItems.forEach((item, i) => {
      this.setState(previousState => ({
          playlistItemUris: [...previousState.playlistItemUris, item.track.uri]
      }))
    })
    this.replacePlaylistSongs()
    return "Done"
  }

  // Clears the playlist of all songs
  replacePlaylistSongs () {
    axios.put('http://localhost:5000/playlist/replace',
      {access_token: this.props.userToken,
      playlist_id: this.props.playlistId,
      songs: []})
        .then(() => console.log("Emtptied"))
        .catch(error => console.log(error))
  }

  // Request to add all the songs from the ones saved in state to the selected playlist.
  addToPlaylist(offset) {
    if (this.state.playlistItemUris.length - offset <= 100) {
      axios.post('http://localhost:5000/playlist/add',
      {access_token: this.props.userToken,
      playlist_id: this.props.playlistId,
      songs: this.state.playlistItemUris.slice(offset) })
        .then(() => this.props.updatePlaylists(false))
        .catch(error => console.log(error))
    }
    else {
      axios.post('http://localhost:5000/playlist/add',
      {access_token: this.props.userToken,
      playlist_id: this.props.playlistId,
      songs: this.state.playlistItemUris.slice(offset, offset + 100) })
        .then(() => this.addToPlaylist(offset + 100))
        .catch(error => console.log(error))
    }
  }

  // Function to selecte all the songs in the playlist
  handleSelectAllClick = (event) => {
    this.setState({ checked: [] })
    if (event.target.checked) {
      this.state.playlistItems.forEach((item, i) => {
        this.setState(previousState => ({
            checked: [...previousState.checked, item.track.uri]
        }))
      })
    }
  }

  // Function to see if a song is selected or not
  isSelected = (uri) => this.state.checked.indexOf(uri) !== -1

  // Handle clicking on one of the songs
  handleClick = (event, uri) => {
    const checkedIndex = this.state.checked.indexOf(uri);
    let newChecked = [];

    if (checkedIndex === -1) {
      newChecked = newChecked.concat(this.state.checked, uri);
    } else if (checkedIndex === 0) {
      newChecked = newChecked.concat(this.state.checked.slice(1));
    } else if (checkedIndex === this.state.checked.length - 1) {
      newChecked = newChecked.concat(this.state.checked.slice(0, -1));
    } else if (checkedIndex > 0) {
      newChecked = newChecked.concat(
        this.state.checked.slice(0, checkedIndex),
        this.state.checked.slice(checkedIndex + 1),
      );
    }

    this.setState({ checked: newChecked })
  };

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

  // Display the edit info modal.
  showEditModal = type => {
    this.setState({
      showModal: true,
      modalInfo: {
        ...this.props.selectedPlaylistInfo,
        modalType: type,
        userId: this.props.userId
      }
    })
  }

  render() {
    const { classes } = this.props;

    if (this.state.playlistItems.length == 0) {
      return (
        <h2 className={classes.noSongs}>
          There are no songs in this playlist. <br/> Searching for songs is coming soon! <br/> Please go to spotify to add songs to this playlist.
        </h2>
      )
    }
    else {
      return (
        <Paper square className={classes.paper}>
          <PlaylistModel
            open={this.state.showModal}
            closeModal={() => this.setState({ showModal: false })}
            accessToken={this.props.userToken}
            modalInfo={this.state.modalInfo}
            updatePlaylists={this.props.updatePlaylists}

          />
          <TableContainer classes={{root: classes.rootTableContainer}}>
            {
              this.props.playlistId == "Liked Songs" ?
                <Paper square className={classes.infoPaper}>
                  <div className={classes.likedSongsImage}>
                    <FavoriteIcon className={classes.heartIcon}/>
                  </div>
                  <div>
                    <Typography variant="h3" className={classes.playlistInfo}>
                      Liked Songs
                    </Typography>
                    <Typography variant="body1" gutterBottom className={classes.playlistInfo}>
                      Name
                      <FiberManualRecordIcon classes={{root: classes.dot}}/>
                      {this.state.playlistItems.length} Songs
                    </Typography>
                  </div>
                </Paper>
              :
              <Paper square className={classes.infoPaper}>
                {this.props.selectedPlaylistInfo.images ?
                  <img src={this.props.selectedPlaylistInfo.images[0].url} alt="Playlist Image" className={classes.playlistImage}/>
                  :
                  <div/>
                }
                <div>
                  <Typography variant="caption" display="block" gutterBottom className={classes.infoPC}>
                    {this.props.selectedPlaylistInfo.editable ?
                      <div>
                        {this.props.selectedPlaylistInfo.public ? "PUBLIC" : "PRIVATE"}
                        {this.props.selectedPlaylistInfo.collaborative ? <FiberManualRecordIcon className={classes.dotPC}/> : ""}
                      </div>
                    :
                      <div/>}
                    {this.props.selectedPlaylistInfo.collaborative ? "COLLABORATIVE" : ""}
                  </Typography>
                  <Typography variant="h3" className={classes.playlistInfo}>
                    {this.props.selectedPlaylistInfo.editable ?
                      <div onClick={() => this.showEditModal("EditInfo")} className={classes.playlistTitle}>
                        {this.props.selectedPlaylistInfo.name}
                      </div>
                    :
                      this.props.selectedPlaylistInfo.name}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {this.props.selectedPlaylistInfo.description}
                  </Typography>
                  <Typography variant="body1" gutterBottom className={classes.playlistInfo}>
                    {this.props.selectedPlaylistInfo.owner.display_name}
                    <FiberManualRecordIcon classes={{root: classes.dot}}/>
                    {this.state.playlistItems.length} Songs
                  </Typography>
                </div>
              </Paper>
            }

            <Table
              stickyHeader
              size='medium'
            >
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" classes={{stickyHeader: classes.headerColor}}>
                    <Checkbox
                      indeterminate={0 < this.state.checked.length && this.state.checked.length < this.state.playlistItems.length}
                      checked={this.state.checked.length == this.state.playlistItems.length}
                      onChange={event => this.handleSelectAllClick(event)}
                      classes={{root: classes.icon, colorSecondary: classes.colorSecondaryCheckbox, checked: classes.checked}}
                    />
                  </TableCell>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.numeric ? 'right' : 'left'}
                      padding={headCell.disablePadding ? 'none' : 'default'}
                      sortDirection={this.state.orderBy === headCell.id ? this.state.order : false}
                      classes={{stickyHeader: classes.headerColor}}
                    >
                      {this.props.selectedPlaylistInfo.editable ?
                          <TableSortLabel
                            active={this.state.orderBy === headCell.id}
                            direction={this.state.orderBy === headCell.id ? this.state.order : 'asc'}
                            onClick={() => this.sortSongs(headCell.id)}
                            classes={{root: classes.rootSortLabel, active: classes.active, icon: classes.icon}}
                          >
                            {headCell.label}
                          </TableSortLabel>
                        :
                          <div>
                            {headCell.label}
                          </div>
                      }
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  this.state.playlistItems.map((row, index) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        key={row.track.id}
                        selected={this.isSelected(row.track.uri)}
                        onClick={event => this.handleClick(event, row.track.uri)}
                        classes={{root: classes.rootTableRow, hover: classes.hover, selected: classes.selected}}
                      >
                        <TableCell padding="checkbox" className={classes.tableCell}>
                          <Checkbox
                            checked={this.isSelected(row.track.uri)}
                            classes={{root: classes.icon, colorSecondary: classes.colorSecondaryCheckbox, checked: classes.checked}}
                          />
                        </TableCell>
                        <TableCell align="right" className={classes.tableCell}>{index+1}</TableCell>
                        <TableCell classes={{root: classes.titleCell}} className={classes.tableCell}>
                          <Avatar variant='square' alt={row.track.album.name} src={row.track.album.images[row.track.album.images.length - 1].url} />
                          <div className={classes.songTitle}>
                            {row.track.name}
                          </div>
                        </TableCell>
                        <TableCell className={classes.tableCell}>{row.track.album.name}</TableCell>
                        <TableCell className={classes.tableCell}>
                          {
                            row.track.artists.map(artist => {
                              return (
                                artist.name
                              )
                            }).join(", ")
                          }
                        </TableCell>
                        <TableCell align="right" className={classes.tableCell}>
                          {Math.floor(row.track.duration_ms / 60000) + ":" + ("0" + Math.floor((row.track.duration_ms % 60000) / 1000)).substr(-2)}
                        </TableCell>
                        <TableCell className={classes.tableCell}>{this.timestampToString(row.added_at)}</TableCell>
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )
    }
  }
}

export default withStyles(styles)(Main);
