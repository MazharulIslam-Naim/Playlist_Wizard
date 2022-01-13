import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import Sidebar from '../components/sidebar';
import Main from '../components/main';
import Appbar from '../components/appbar';
import Error from '../components/error';

import Grid from '@material-ui/core/Grid';

export default class User extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlists: [],
      user: {},
      selectedPlaylist: '',
      selectedPlaylistInfo: {},
      errorAlert: false
    }
  }

  // Get the user information of the current user from the database.
  async componentDidMount() {
    await axios.get('/user/' + this.props.location.state.email)
      .then(res => this.setState({ user: res.data[0] }))
      .catch(error => console.log(error))
    this.timeToRefreshToken()
    this.getPlaylists(true)
  }

  // Unmounts refresh token timer function
  componentWillUnmount() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle)
      this.timerHandle = 0
    }
  }

  // Calls the refreshToken function a minute before the token expires.
  timeToRefreshToken() {
    var currTime = new Date()
    var expireTime = new Date(this.state.user.expire_time)

    if (expireTime <= currTime) {
      this.refreshToken()
    }
    else {
      this.timerHandle = setTimeout(() => this.refreshToken(), expireTime - currTime)
    }
  }

  // Refresh the access token and add it to the database.
  refreshToken() {
    var currTime = new Date()
    var expireTime = new Date(this.state.user.expire_time)

    if (expireTime <= currTime) {
      axios.post('/user/refresh_token/', {refresh_token: this.state.user.refresh_token})
        .then(res => {
          currTime.setSeconds( currTime.getSeconds() + res.data.expires_in - 60 )
          const newToken = {
            id: this.state.user.id,
            display_name: this.state.user.display_name,
            email: this.state.user.email,
            access_token: res.data.access_token,
            expires_in: res.data.expires_in,
            refresh_token: this.state.user.refresh_token,
            expire_time: currTime,
          }

          this.setState({ user: newToken })
          axios.post('/user/update', newToken)
            .then(res => {
              console.log(res.data + " " + "Access token refreshed.")
              this.timeToRefreshToken()
            })
            .catch(error => console.log(error))
        })
        .catch(error => {console.log(error); this.setState({ errorAlert: true })})
    }
  }

  // Request all the playlists of the current user.
  getPlaylists = async changeToFirst => {
    var next = true
    var songs = []
    for (var i = 0; next; i = i + 50) {
      await axios.get('/playlist/', {params: {access_token: this.state.user.access_token, offset: i}})
        .then(res => {
          songs = songs.concat(res.data.items)
          if (res.data.next == null) {
            next = false
          }
        })
        .catch(error => {console.log(error); this.setState({ errorAlert: true })})
    }
    this.setState({ playlists: songs })
    if (songs.length != 0) {
      if (changeToFirst) {
        this.selectPlaylist(songs[0].id)
      }
      else { this.setSelectedPlaylistInfo(this.state.selectedPlaylist) }
    }
    else {
      this.selectPlaylist("Liked Songs")
    }
  }

  // Select the playlist.
  selectPlaylist = playlistId => {
    this.setState({ selectedPlaylist: playlistId })
    this.setSelectedPlaylistInfo(playlistId)
  }

  // When the selected playlist changes, change to the info of the selected playlist.
  setSelectedPlaylistInfo(playlistId) {
    if (playlistId) {
      if (playlistId == "Liked Songs") {
        this.setState({ selectedPlaylistInfo: {name: "Liked Songs", description: "", public: true, collaborative: false, editable : false} })
      }
      else {
        var result = this.state.playlists.filter(obj => {
          return obj.id === playlistId
        })
        result[0].editable = result[0].owner.id == this.state.user.id
        this.setState({ selectedPlaylistInfo: result[0] })
      }
    }
  }

  render() {
    try {
      if (this.props.location.state.email == 'undefined') {}
    }
    catch(e) {
      return <Redirect to="/" push />
    }

    return (
      <div
        style={{
          backgroundColor: "#282c34",
          overflow: "auto",
          display: "flex",
        }}
      >
        <Sidebar
          userToken={this.state.user.access_token}
          userId={this.state.user.id}
          selectedPlaylist={this.state.selectedPlaylist}
          onSelectPlaylist={this.selectPlaylist}
          playlists={this.state.playlists}
          updatePlaylists={this.getPlaylists}
          alertError={() => this.setState({ errorAlert: true })}
        />
        <Main
          userToken={this.state.user.access_token}
          userId={this.state.user.id}
          displayName={this.state.user.display_name}
          playlistId={this.state.selectedPlaylist}
          selectedPlaylistInfo={this.state.selectedPlaylistInfo}
          updatePlaylists={this.getPlaylists}
          alertError={() => this.setState({ errorAlert: true })}
        />
        <Error open={this.state.errorAlert} handleClose={() => this.setState({ errorAlert: false })}/>
      </div>
    )
  }
}
