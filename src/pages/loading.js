import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import './login.css';

var url = require('url');

export default class Loading extends Component {
  constructor(props) {
    super(props);
    this.getUser = this.getUser.bind(this);
    this.userFind = this.userFind.bind(this);
    this.userCreate = this.userCreate.bind(this);
    this.userUpdate = this.userUpdate.bind(this);

    this.state = {
      redirect: '',
      authToken: {},
      email: ''
    }
  }

  componentDidMount() {
    var urlp = url.parse(document.URL, true)
    var urldata = urlp.query
    if (!urldata.code) {
      this.setState({ redirect: 'homepage' })
    }
    else {
      axios.get('http://localhost:5000/authorize/'+urldata.code)
        .then(res => {
          this.setState({ authToken: res.data })
          this.getUser()
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  getUser() {
    const user = { access_token: this.state.authToken.access_token }
    axios.post('http://localhost:5000/authorize/user', user)
      .then(res => {
        this.setState({ email: res.data.email })
        this.userFind()
      })
      .catch((error) => {
        console.log(error)
      })
  }

  userFind() {
    axios.get('http://localhost:5000/user/'+this.state.email)
      .then(res => {
        if (res.data.length == 0) {
          this.userCreate()
        } else {
          this.userUpdate()
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  userCreate() {
    const user = {
      email: this.state.email,
      access_token: this.state.authToken.access_token,
      expires_in: this.state.authToken.expires_in,
      refresh_token: this.state.authToken.refresh_token,
    }

    axios.post('http://localhost:5000/user/add', user)
      .then(res => {
        console.log(res.data)
        this.setState({ redirect: 'user' })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  userUpdate() {
    const user = {
      email: this.state.email,
      access_token: this.state.authToken.access_token,
      expires_in: this.state.authToken.expires_in,
      refresh_token: this.state.authToken.refresh_token,
    }

    axios.post('http://localhost:5000/user/update', user)
      .then(res => {
        console.log(res.data)
        this.setState({ redirect: 'user' })
      })
      .catch((error) => {
        console.log(error)
      })
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
