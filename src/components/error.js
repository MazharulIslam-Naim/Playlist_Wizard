import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';

const styles = theme => ({
  alert: {
    zIndex: "3000",
  },
  errorAlert: {
    backgroundColor: "#D32F2F",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    fontSize: "1rem",
  }
});

class Error extends Component {
  constructor(props) {
    super(props);

    this.state = {

    }
  }

  close = () => {
    this.props.handleClose()
    window.location.reload()
  }

  render() {
    const { classes } = this.props;

    return (
      <Snackbar open={this.props.open} autoHideDuration={6000} onClose={this.close} className={classes.alert}>
        <SnackbarContent className={classes.errorAlert} message="Error: Something went wrong!"/>
      </Snackbar>
    )
  }
}

export default withStyles(styles)(Error);
