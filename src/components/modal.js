import React, { Component } from 'react';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  paper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  },
  modalBody: {
    margin: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
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
      collaborative: false
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
        collaborative: this.props.modalInfo.collaborative
       })
    }
  }

  // Request to create a new playlist.
  createPlaylist = () => {
    axios.post('http://localhost:5000/playlist/new', {access_token: this.props.accessToken, user_id: this.props.modalInfo.userId, name: this.state.name})
      .then(res => {
        this.setState({ newPlaylistId: res.data.id })
        if (this.props.modalInfo.modalType  == "New") {
          this.props.updatePlaylists(true)
        }
        this.editInfoPlaylist()
      })
      .catch(error => console.log(error))
    this.props.closeModal()
  }

  // Duplicates the selected playlist.
  duplicatePlaylist = () => {
    this.createPlaylist()
    this.setState({ playlistItems: [] })
    if (this.props.modalInfo == "Liked Songs") {
      this.getSavedItems(0)
    }
    else {
      this.getPlaylistItems(0)
    }
    this.props.closeModal()
  }

  // Get the current user's saved songs.
  getSavedItems(offset) {
    axios.get('http://localhost:5000/playlist/saved_items', {params: {access_token: this.props.accessToken, offset: offset} })
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
    axios.get('http://localhost:5000/playlist/playlist_items',
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
        axios.post('http://localhost:5000/playlist/add',
        {access_token: this.props.accessToken,
        playlist_id: this.state.newPlaylistId,
        songs: this.state.playlistItems.slice(offset) })
          .then(() => this.props.updatePlaylists(true))
          .catch(error => console.log(error))
      }
      else {
        axios.post('http://localhost:5000/playlist/add',
        {access_token: this.props.accessToken,
        playlist_id: this.state.newPlaylistId,
        songs: this.state.playlistItems.slice(offset, offset + 100) })
          .then(() => this.addToPlaylist(offset + 100))
          .catch(error => console.log(error))
      }
    }
    else {
      this.props.updatePlaylists(true)
    }
  }

  // Request to edit the info of a playlist.
  editInfoPlaylist = () => {
    axios.put('http://localhost:5000/playlist/edit', {
      access_token: this.props.accessToken,
      playlist_id: this.props.modalInfo.modalType  == "EditInfo" ? this.props.modalInfo.id : this.state.newPlaylistId,
      name: this.state.name,
      description: this.state.description,
      public: this.state.public,
      collaborative: this.state.collaborative
    })
      .then(() => {
        this.props.updatePlaylists(false)
      })
      .catch(error => console.log(error))
    this.props.closeModal()
  }

  // Request to delete a playlist.
  deletePlaylist = () => {
    axios.delete('http://localhost:5000/playlist/delete', {params: {access_token: this.props.accessToken, playlist_id: this.props.modalInfo.id}})
      .then(() => this.props.updatePlaylists(true))
      .catch(error => console.log(error))
    this.props.closeModal()
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

  // New playlist modal body.
  newPLBody() {
    const { classes } = this.props;

    return (
      <div className={classes.modalBody}>
        <h2>Please change the new playlist's info to your specifications:</h2>
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
    )
  }

  // duplicate playlist modal body.
  duplicatePLBody() {
    const { classes } = this.props;

    return (
      <div className={classes.modalBody}>
        <h2>Please change the duplicate playlist's info to your specifications:</h2>
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
    )
  }

  // Edit playlist info modal body.
  editInfoPLBody() {
    const { classes } = this.props;

    return (
      <div className={classes.modalBody}>
        <h2>Edit details of playlist <u>{this.props.modalInfo.name}</u>:</h2>
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
    )
  }

  // Delete playlist modal body.
  deletePLBody() {
    const { classes } = this.props;

    return (
      <div className={classes.modalBody}>
        <h2>Are you sure you want to delete the playlist: <u>{this.props.modalInfo.name}</u>?</h2>
        <div className={classes.buttons}>
          <Button
            variant="contained"
            onClick={() => this.deletePlaylist()}
            classes={{root: classes.delete}}
          >
            Delete
          </Button>
          <Button variant="contained" onClick={() => this.props.closeModal()}>Cancel</Button>
        </div>
      </div>
    )
  }

  render() {
    const { classes } = this.props;

    return (
      <Modal
        open={this.props.open}
        onClose={() => this.props.closeModal()}
      >
        <Paper className={classes.paper}>
          {
            this.props.modalInfo.modalType  == "New" ?
              this.newPLBody()
              : this.props.modalInfo.modalType  == "Duplicate" ?
                this.duplicatePLBody()
                : this.props.modalInfo.modalType  == "EditInfo" ?
                  this.editInfoPLBody()
                  : this.props.modalInfo.modalType  == "Delete" ?
                    this.deletePLBody()
                    : <div/>
          }
        </Paper>
      </Modal>
    )
  }
}

export default withStyles(styles)(PlaylistModel);
