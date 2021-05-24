// First page the user starts of on.
import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import './login.css';

export default class Login extends Component {
  constructor(props) {
    super(props);
  }

  // Function called when the user clicks to login. Gets the url to redirt to
  // spotify login.
  onLogin = () => {
    axios.get('http://localhost:5000/authorize')
      .then(res => window.open(res.data, "_self"))
      .catch(error => console.log(error))
  }

  render() {
    return (
      <div className="Main">
        <h1>Playlist Wizard</h1>
        <p>
          Organize, view and create Spotify playlists easily!
          Playlist wizard allows you to create new playlists effortlessly by searching
          Spotify and picking songs from your own playlists.
          You can also sort the playlists by song name, album, and date added.
          The playlist on shuffle with no repeating songs.
        </p>
        <p>
          Login to Spotify to get started!
        </p>
        <Button
          variant="contained"
          onClick={this.onLogin}
          style={{
                backgroundColor: "#1db954",
                color: "white"
              }}
          disableElevation
        >
          LOGIN WITH SPOTIFY
        </Button>
      </div>
    )
  }
}
