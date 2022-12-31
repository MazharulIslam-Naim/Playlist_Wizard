import React, { Component } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

export default class Appbar extends Component {
  constructor(props) {
    super(props);

    this.state = {

    }
  }



  render() {
    return (
      <AppBar position="fixed" >
        <Toolbar>

        </Toolbar>
      </AppBar>
    )
  }
}
