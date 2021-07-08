import React, { Component } from 'react';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  root: {
    margin: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
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
      newPlaylistId: "",
      playlistItems: []
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.modalType.name !== prevProps.modalType.name) {
      this.setState({ name: this.props.modalType.name })

    }
  }

  // Request to create a new playlist.
  createPlaylist = () => {
    axios.post('http://localhost:5000/playlist/new', {access_token: this.props.accessToken, user_id: this.props.modalType.userId, name: this.state.name})
      .then(res => {
        this.setState({ newPlaylistId: res.data.id })
        if (this.props.modalType.type  == "new") {
          this.props.updatePlaylists(true)
        }
      })
      .catch(error => console.log(error))
    this.props.closeModal()
  }

  // Duplicates the selected playlist.
  duplicatePlaylist = () => {
    this.createPlaylist()
    this.setState({ playlistItems: [] })
    if (this.props.modalType.playlistId == "Liked Songs") {
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
      {params: {access_token: this.props.accessToken, playlist_id: this.props.modalType.playlistId, offset: offset}}
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
    if (this.state.playlistItems > 0) {
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

  // Request to rename a playlist.
  renamePlaylist = () => {
    axios.put('http://localhost:5000/playlist/rename', {access_token: this.props.accessToken, playlist_id: this.props.modalType.playlistId, name: this.state.name})
      .then(() => this.props.updatePlaylists(false))
      .catch(error => console.log(error))
    this.props.closeModal()
  }

  // Request to delete a playlist.
  deletePlaylist = () => {
    axios.delete('http://localhost:5000/playlist/delete', {params: {access_token: this.props.accessToken, playlist_id: this.props.modalType.playlistId}})
      .then(() => this.props.updatePlaylists(true))
      .catch(error => console.log(error))
    this.props.closeModal()
  }

  // New playlist modal body.
  newPLBody() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <h2>Give the new playlist a title:</h2>
        <TextField
          required
          label="Required"
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
    )
  }

  // duplicate playlist modal body.
  duplicatePLBody() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <h2>Would you like to give the duplicate playlist a different name?</h2>
        <TextField
          required
          label="Required"
          defaultValue={this.state.name}
          onChange={e => this.setState({ name: e.target.value })}
        />
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

  // Rename playlist modal body.
  renamePLBody() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <h2>Give a different name to the playlist: <u>{this.props.modalType.name}</u>?</h2>
        <TextField
          required
          label="Required"
          defaultValue={this.state.name}
          onChange={e => this.setState({ name: e.target.value })}
        />
        <div className={classes.buttons}>
          <Button
            variant="contained"
            disabled={this.state.name == ""}
            onClick={() => this.renamePlaylist()}
            classes={{root: classes.success}}
          >
            Rename
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
      <div className={classes.root}>
        <h2>Are you sure you want to delete the playlist: <u>{this.props.modalType.name}</u>?</h2>
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
        <Paper
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}
        >
          {
            this.props.modalType.type  == "new" ?
              this.newPLBody()
              : this.props.modalType.type  == "Duplicate" ?
                this.duplicatePLBody()
                : this.props.modalType.type  == "Rename" ?
                  this.renamePLBody()
                  : this.props.modalType.type  == "Delete" ?
                    this.deletePLBody()
                    : <div/>
          }
        </Paper>
      </Modal>
    )
  }
}

export default withStyles(styles)(PlaylistModel);
