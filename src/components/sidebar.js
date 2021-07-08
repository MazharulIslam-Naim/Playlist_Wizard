import React, { Component } from 'react';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Fab from '@material-ui/core/Fab';
import FavoriteIcon from '@material-ui/icons/Favorite';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import PlaylistModel from './modal';

const styles = theme => ({
  sidebar: {
    backgroundColor: "transparent",
    color: "white",
    maxWidth: "180px"
  },
  addPlaylistButton: {
    backgroundColor: "#1db954",
    color: "white",
    margin: "10px",
    minHeight: "48px"
  },
  playlistButton: {
    '&$selected, &$selected:hover': {
      backgroundColor: "rgba(0, 0, 0, 0.35)"
    },
  },
  favorite : {
    backgroundColor: "#1db954"
  },
  divider: {
    margin: "10px 16px",
    backgroundColor: "rgba(255, 255, 255, 0.35)"
  },
  button: {
    '&:hover': {
      backgroundColor: "rgba(0, 0, 0, 0.35)"
    }
  },
  selected: {
    backgroundColor: "rgba(0, 0, 0, 0.35)"
  }
});


class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      showMenu: false,
      menuPos: {xPos: 0, yPos: 0},
      modal: {},
      selectedPlaylist: ''
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedPlaylist !== prevProps.selectedPlaylist) {
      this.setState({ selectedPlaylist: this.props.selectedPlaylist })
    }
  }

  showContextMenu = (e, playlistId, playlistName) => {
    e.preventDefault()
    this.setState({ showMenu: true, menuPos: {xPos: e.clientX, yPos: e.clientY}, modal: {playlistId: playlistId, name: playlistName} })
  }

  menuItemClick = type => {
    this.setState({
      showModal: true,
      showMenu: false,
      menuPos: {xPos: 0, yPos: 0},
      modal: {type: type, name: this.state.modal.name, playlistId: this.state.modal.playlistId, userId: this.props.userId}
    })
  }

  render() {
    const { classes } = this.props;

    return (
      <Drawer variant="permanent" classes={{paper: classes.sidebar}}>
        <PlaylistModel
          open={this.state.showModal}
          closeModal={() => this.setState({ showModal: false })}
          accessToken={this.props.userToken}
          modalType={this.state.modal}
          updatePlaylists={this.props.updatePlaylists}
        />
        <Fab
          className={classes.addPlaylistButton}
          variant="extended"
          onClick={() => {
            this.setState({
              showModal: true,
              modal: {type: "new", name: "New Playlist", userId: this.props.userId}
            })
          }}
        >
          <AddIcon />
        </Fab>
        <List>
          <ListItem
            button
            key="Liked Songs"
            selected={this.state.selectedPlaylist == "Liked Songs"}
            onClick={() => {
              this.props.onSelectPlaylist("Liked Songs")
              this.setState({ selectedPlaylist: "Liked Songs" })
            }}
            onContextMenu={ev => this.showContextMenu(ev, "Liked Songs", "Liked Songs")}
            classes={{root: classes.playlistButton, button: classes.button, selected: classes.selected}}
          >
            <ListItemAvatar>
              <Avatar variant='square' className={classes.favorite}>
                <FavoriteIcon />
              </Avatar>
            </ListItemAvatar>

            <ListItemText primary="Liked Songs" />
          </ListItem>
          <Divider className={classes.divider}/>
          <div style={{overflowY: "auto"}}>
          {
            this.props.playlists.map((playlist, index) => (
              <ListItem
                button
                key={playlist.id}
                selected={this.state.selectedPlaylist == playlist.id}
                onClick={() => {
                  this.props.onSelectPlaylist(playlist.id)
                  this.setState({ selectedPlaylist: playlist.id })
                }}
                onContextMenu={ev => this.showContextMenu(ev, playlist.id, playlist.name)}
                classes={{root: classes.playlistButton, button: classes.button, selected: classes.selected}}
              >
                {playlist.images.length != 0 ?
                  <ListItemAvatar>
                    <Avatar variant='square' alt={playlist.name} src={playlist.images[playlist.images.length - 1].url} />
                  </ListItemAvatar>
                  :
                  <ListItemAvatar>
                    <Avatar variant='square'>
                      {playlist.name.[0]}
                    </Avatar>
                  </ListItemAvatar>
                }

                <ListItemText primary={playlist.name} />
              </ListItem>
            ))
          }
          </div>
          <Menu
            open={this.state.showMenu}
            onClose={() => this.setState({ showMenu: false, menuPos: {xPos: 0, yPos: 0}, modal: {} })}
            anchorReference="anchorPosition"
            anchorPosition={{ top: this.state.menuPos.yPos, left: this.state.menuPos.xPos }}
          >
            <MenuItem onClick={() => this.menuItemClick("Duplicate")}>Duplicate</MenuItem>
            {this.state.modal.playlistId != "Liked Songs" ? <MenuItem onClick={() => this.menuItemClick("Rename")}>Rename</MenuItem> : <div/>}
            {this.state.modal.playlistId != "Liked Songs" ? <MenuItem onClick={() => this.menuItemClick("Delete")}>Delete</MenuItem> : <div/>}
          </Menu>
        </List>

      </Drawer>
    )
  }
}

export default withStyles(styles)(Sidebar);
