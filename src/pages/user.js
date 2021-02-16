import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

export default class User extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {}
    }
  }

  componentDidMount() {
    axios.get('http://localhost:5000/user/'+this.props.location.state.email)
      .then(res => {
        this.setState({ user: res.data[0] })
        // Figure ot how to time the refreshToken request after it expires.
        this.refreshToken()
        // setTimeout(() => {
        //
        // }, res.data[0].expires_in-60)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  refreshToken() {
    axios.get('http://localhost:5000/user/refresh_token/'+this.state.user.refresh_token)
      .then(res => {
        const newToken = {
          email: this.state.user.email,
          access_token: res.data.access_token,
          expires_in: res.data.expires_in,
          refresh_token: this.state.user.refresh_token,
        }

        this.setState({ user: newToken })
        axios.post('http://localhost:5000/user/update', newToken)
          .then(res => { console.log(res.data) })
          .catch((error) => { console.log(error) })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  render() {
    //Figure out how to redirect people form /user to homepage if no props sent.
    // try {
    //   if (this.props.location.state.email == 'undefined') {}
    // }
    // catch(e) {
    //   return <Redirect to="/" push />
    // }
    return (
      <div className="Main">
      </div>
    )
  }
}
