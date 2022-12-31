import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  loading: {
    height: "100vh",
    width: "100vw",
    zIndex: "2000",
    position: "absolute",
    top: "0",
    left: "0",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  circularAnimation: {
    color: "#1db954"
  }
});

class Loading extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div>
        {this.props.isLoading ?
          <div className={classes.loading}>
            <CircularProgress classes={{root: classes.circularAnimation}} style={{width: "80px", height: "80px"}}/>
          </div>
        :
          <div/>
        }
      </div>
    )
  }
}

export default withStyles(styles)(Loading);
