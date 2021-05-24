import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import Sidebar from '../components/sidebar';
import Main from '../components/main';
import Appbar from '../components/appbar';

import Grid from '@material-ui/core/Grid';

export default class User extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlists: [],
      user: {},
      selectedPlaylist: '',
    }
  }

  // Get the user information of the current user from the database.
  async componentDidMount() {
    await axios.get('http://localhost:5000/user/' + this.props.location.state.email)
      .then(res => this.setState({ user: res.data[0] }))
      .catch(error => console.log(error))
    this.getPlaylists(0)
  }

  // When pages updates call the refresh token function.
  componentDidUpdate(prevProps) {
    this.refreshToken()
  }

  // refresh the access token.
  async refreshToken() {
    var currTime = new Date()
    if (this.state.user && this.state.user.expire_time < currTime.toISOString()) {
      await axios.get('http://localhost:5000/user/refresh_token/'+this.state.user.refresh_token)
        .then(res => {
          var dt = new Date();
          dt.setSeconds( dt.getSeconds() + res.data.expires_in - 60 );
          const newToken = {
            id: this.state.user.id,
            email: this.state.user.email,
            access_token: res.data.access_token,
            expires_in: res.data.expires_in,
            refresh_token: this.state.user.refresh_token,
            expire_time: dt,
          }

          this.setState({ user: newToken })
          axios.post('http://localhost:5000/user/update', newToken)
            .then(res => console.log(res.data))
            .catch(error => console.log(error))
          console.log("Access token refreshed.")
        })
        .catch(error => console.log(error))
    }
  }

  // Request the playlist of the current user.
  getPlaylists(offset) {
    axios.post('http://localhost:5000/playlist/', {access_token: this.state.user.access_token, offset: offset})
      .then(res => {
        this.setState({ playlists: this.state.playlists.concat(res.data.items) })
        if (res.data.next) {
          this.getPlaylists(offset + 50)
        }
        if (res.data.items.length != 0) {
          this.selectPlaylist(res.data.items[0].id)
        }
      })
      .catch(error => console.log(error))
  }

  // Select the playlist.
  selectPlaylist = playlistId => this.setState({ selectedPlaylist: playlistId })

  // Refresh the list of playlists.
  updatePlaylists = () => {
    this.setState({ playlists: [] })
    this.getPlaylists(0)
  }

  render() {
    //Figure out how to redirect people form /user to homepage if no props sent.
    // try {
    //   if (this.props.location.state.email == 'undefined') {}
    // }
    // catch(e) {
    //   return <Redirect to="/" push />
    // }
    this.refreshToken()
    return (
      <div>
        <Grid container spacing={0}>
          <Grid item xs={2}>
            <Sidebar
              userToken={this.state.user.access_token}
              userId={this.state.user.id}
              onSelectPlaylist={this.selectPlaylist}
              playlists={this.state.playlists}
              updatePlaylists={this.updatePlaylists}
            />
          </Grid>
          <Grid item xs={10}>
            <Main user = {this.state.user.access_token} playlistId = {this.state.selectedPlaylist} />
          </Grid>
        </Grid>
      </div>
    )
  }
}
