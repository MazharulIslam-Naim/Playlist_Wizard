import React, { Component } from 'react';
import axios from 'axios';

import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

export default class PlaylistModel extends Component {
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
          this.props.updatePlaylists()
        }
      })
      .catch(error => console.log(error))
    this.props.closeModal()
  }

  // Duplicates the selected playlist.
  duplicatePlaylist = async () => {
    await this.createPlaylist()
    this.setState({ playlistItems: [] })
    this.getPlaylistItems(0)
    this.props.closeModal()
  }

  // Gets all the songs in the current playlist and saves only the uri of each song.
  getPlaylistItems(offset) {
    axios.post('http://localhost:5000/playlist/playlist_items', {access_token: this.props.accessToken, playlist_id: this.props.modalType.playlistId, offset: offset})
      .then(res => {
        res.data.items.forEach((item, i) => {
          this.setState({ playlistItems: this.state.playlistItems.concat([item.track.uri]) })
        });
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
    if (this.state.playlistItems.length - offset <= 100) {
      axios.post('http://localhost:5000/playlist/add',
      {access_token: this.props.accessToken,
      playlist_id: this.state.newPlaylistId,
      songs: this.state.playlistItems.slice(offset) })
        .then(() => this.props.updatePlaylists())
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

  // Request to rename a playlist.
  renamePlaylist = () => {
    axios.put('http://localhost:5000/playlist/rename', {access_token: this.props.accessToken, playlist_id: this.props.modalType.playlistId, name: this.state.name})
      .then(() => this.props.updatePlaylists())
      .catch(error => console.log(error))
    this.props.closeModal()
  }

  // Request to delete a playlist.
  deletePlaylist = () => {
    axios.post('http://localhost:5000/playlist/delete', {access_token: this.props.accessToken, playlist_id: this.props.modalType.playlistId})
      .then(() => this.props.updatePlaylists())
      .catch(error => console.log(error))
    this.props.closeModal()
  }

  // New playlist modal body.
  newPLBody() {
    return (
      <div>
        <h2>Give the new playlist a title.</h2>
        <TextField
          required
          label="Required"
          defaultValue={this.state.name}
          onChange={e => this.setState({ name: e.target.value })}
        />
        <Button variant="contained" disabled={this.state.name == ""} onClick={() => this.createPlaylist()}>Create Playlist</Button>
        <Button variant="contained" onClick={() => this.props.closeModal()}>Cancel</Button>
      </div>
    )
  }

  // duplicate playlist modal body.
  duplicatePLBody() {
    return (
      <div>
        <h2>Would you like to give this duplicate playlist a different name?</h2>
        <TextField
          required
          label="Required"
          defaultValue={this.state.name}
          onChange={e => this.setState({ name: e.target.value })}
        />
        <Button variant="contained" disabled={this.state.name == ""} onClick={() => this.duplicatePlaylist()}>Duplicate Playlist</Button>
        <Button variant="contained" onClick={() => this.props.closeModal()}>Cancel</Button>
      </div>
    )
  }

  // Rename playlist modal body.
  renamePLBody() {
    return (
      <div>
        <h2>Give <b>{this.props.modalType.name}</b> playlist a different name.</h2>
        <TextField
          required
          label="Required"
          defaultValue={this.state.name}
          onChange={e => this.setState({ name: e.target.value })}
        />
        <Button variant="contained" disabled={this.state.name == ""} onClick={() => this.renamePlaylist()}>Rename Playlist</Button>
        <Button variant="contained" onClick={() => this.props.closeModal()}>Cancel</Button>
      </div>
    )
  }

  // Delete playlist modal body.
  deletePLBody() {
    return (
      <div>
        <h2>Are you sure you want to delete <b>{this.props.modalType.name}</b> playlist?</h2>
        <Button variant="contained" onClick={() => this.deletePlaylist()}>Delete Playlist</Button>
        <Button variant="contained" onClick={() => this.props.closeModal()}>Cancel</Button>
      </div>
    )
  }

  render() {
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
