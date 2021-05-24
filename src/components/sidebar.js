import React, { Component } from 'react';
import axios from 'axios';

import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import PlaylistModel from './modal';

export default class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      showMenu: false,
      menuPos: {xPos: 0, yPos: 0},
      modal: {}
    }
  }

  showContextMenu = (e, playlistId, playlistName) => {
    e.preventDefault();
    this.setState({ showMenu: true, menuPos: {xPos: e.clientX, yPos: e.clientY}, modal: {playlistId: playlistId, name: playlistName} });
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
    return (
      <Drawer variant="permanent">
        <PlaylistModel
          open={this.state.showModal}
          closeModal={() => this.setState({ showModal: false })}
          accessToken={this.props.userToken}
          modalType={this.state.modal}
          updatePlaylists={this.props.updatePlaylists}
        />
        <Fab
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
          {
            this.props.playlists.map((playlist, index) => (
              <ListItem
                button
                key={playlist.id}
                onClick={() => this.props.onSelectPlaylist(playlist.id)}
                onContextMenu={ev => this.showContextMenu(ev, playlist.id, playlist.name)}
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
          <Menu
            open={this.state.showMenu}
            onClose={() => this.setState({ showMenu: false, menuPos: {xPos: 0, yPos: 0}, modal: {} })}
            anchorReference="anchorPosition"
            anchorPosition={{ top: this.state.menuPos.yPos, left: this.state.menuPos.xPos }}
          >
            <MenuItem onClick={() => this.menuItemClick("Duplicate")}>Duplicate</MenuItem>
            <MenuItem onClick={() => this.menuItemClick("Rename")}>Rename</MenuItem>
            <MenuItem onClick={() => this.menuItemClick("Delete")}>Delete</MenuItem>
          </Menu>
        </List>

      </Drawer>
    )
  }
}
