// User gets redirected here for a second to request access token from spotify
// and then redirected to main page.
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import './login.css';

var url = require('url');

export default class Loading extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      authToken: {},
      id: '',
      email: ''
    }
  }

  // Parse the current url for the spotify code then request tokens from spotify.
  componentDidMount() {
    var urlp = url.parse(document.URL, true)
    var urldata = urlp.query
    if (!urldata.code) {
      this.setState({ redirect: 'homepage' })
    }
    else {
      axios.post('http://localhost:5000/authorize/code', {code: urldata.code})
        .then(res => {
          this.setState({ authToken: res.data })
          this.getUser()
        })
        .catch(error => {
          console.log(error)
          this.setState({ redirect: 'homepage' })
        })
    }
  }

  // Get user object from spotify.
  getUser() {
    axios.get('http://localhost:5000/authorize/user', {params: {access_token: this.state.authToken.access_token}})
      .then(res => {
        this.setState({ email: res.data.email, id: res.data.id })
        this.userFind()
      })
      .catch(error => console.log(error))
  }

  // Find the user in the database.
  userFind() {
    axios.get('http://localhost:5000/user/' + this.state.email)
      .then(res => {
        if (res.data.length == 0) {
          // Create user in database if user doesn't exist.
          this.userCreate()
        } else {
          // Update user in database.
          this.userUpdate()
        }
      })
      .catch(error => console.log(error))
  }

  // Create user in database.
  userCreate() {
    var dt = new Date()
    dt.setSeconds( dt.getSeconds() + this.state.authToken.expires_in - 60 )
    const user = {
      id: this.state.id,
      email: this.state.email,
      access_token: this.state.authToken.access_token,
      expires_in: this.state.authToken.expires_in,
      refresh_token: this.state.authToken.refresh_token,
      expire_time: dt,
    }

    axios.post('http://localhost:5000/user/add', user)
      .then(res => {
        console.log(res.data)
        this.setState({ redirect: 'user' })
      })
      .catch(error => console.log(error))
  }

  // Update user in database.
  userUpdate() {
    var dt = new Date()
    dt.setSeconds( dt.getSeconds() + this.state.authToken.expires_in - 60 )
    const user = {
      id: this.state.id,
      email: this.state.email,
      access_token: this.state.authToken.access_token,
      expires_in: this.state.authToken.expires_in,
      refresh_token: this.state.authToken.refresh_token,
      expire_time: dt,
    }

    axios.post('http://localhost:5000/user/update', user)
      .then(res => {
        console.log(res.data)
        this.setState({ redirect: 'user' })
      })
      .catch(error => console.log(error))
  }

  render() {
    if (this.state.redirect == 'homepage') {
      return <Redirect to="/" push />
    } else if (this.state.redirect == 'user') {
      return <Redirect to={{
                pathname: "/user",
                state: { email: this.state.email }
              }}
              push
            />
    } else {
      return (
        <div className="Main">

        </div>
      )
    }
  }
}
