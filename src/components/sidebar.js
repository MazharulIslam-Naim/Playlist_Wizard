import React, { Component } from 'react';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
import Divider from '@material-ui/core/Divider';
import Fab from '@material-ui/core/Fab';
import FavoriteIcon from '@material-ui/icons/Favorite';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';

import PlaylistModel from './modal';
import Loading from './loading';

const styles = theme => ({
  sidebar: {
    backgroundColor: "transparent",
    color: "white",
    width: "10vw",
    height: "100vh",
    minWidth: "180px",
    minHeight: "500px",
    overflow: "auto"
  },
  addPlaylistButton: {
    backgroundColor: "#1db954",
    color: "white",
    margin: "10px",
    minHeight: "48px",
    width: "calc(100% - 20px)"
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
  listItemText: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis"
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
      modalInfo: {},
      selectedPlaylist: '',
      editable: false,
      loading: false
    }
  }

  // If the selected playlist changes then update the selected playlist.
  componentDidUpdate(prevProps) {
    if (this.props.selectedPlaylist !== prevProps.selectedPlaylist) {
      this.setState({ selectedPlaylist: this.props.selectedPlaylist, loading: false })
    }
  }

  // Show the right-click menu drop-down.
  showContextMenu = (e, playlistInfo) => {
    e.preventDefault()
    this.setState({
      showMenu: true,
      menuPos: {xPos: e.clientX, yPos: e.clientY},
      modalInfo: playlistInfo == "Liked Songs" ?
        {name: "Liked Songs", description: "", public: true, collaborative: false, editable : false}
      :
        playlistInfo,
      editable: playlistInfo != "Liked Songs" &&  playlistInfo.owner.id == this.props.userId
    })
  }

  // Selects the menu item from the right-click drop-down, closes the drop-down, and opens the corresponding modal.
  menuItemClick = type => {
    this.setState({
      showModal: true,
      showMenu: false,
      menuPos: {xPos: 0, yPos: 0},
      modalInfo: {...this.state.modalInfo, modalType: type, userId: this.props.userId}
    })
  }

  render() {
    const { classes } = this.props;

    return (
      <Paper className={classes.sidebar}>
        <Loading isLoading={this.state.loading}/>
        <PlaylistModel
          open={this.state.showModal}
          closeModal={() => this.setState({ showModal: false })}
          accessToken={this.props.userToken}
          modalInfo={this.state.modalInfo}
          updatePlaylists={this.props.updatePlaylists}
          isLoading={loadingONorOFF => this.setState({ loading: loadingONorOFF})}
        />
        <Tooltip title="New Playlist">
          <Fab
            className={classes.addPlaylistButton}
            variant="extended"
            onClick={() => {
              this.setState({
                showModal: true,
                modalInfo: {modalType: "New", name: "New Playlist", userId: this.props.userId}
              })
            }}
          >
            <AddIcon />
          </Fab>
         </Tooltip>
        <List>
          <ListItem
            button
            key="Liked Songs"
            selected={this.state.selectedPlaylist == "Liked Songs"}
            onClick={() => {
              this.props.onSelectPlaylist("Liked Songs")
              this.setState({ selectedPlaylist: "Liked Songs" })
            }}
            onContextMenu={ev => this.showContextMenu(ev, "Liked Songs")}
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
                onContextMenu={ev => this.showContextMenu(ev, playlist)}
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

                <ListItemText primary={playlist.name} classes={{primary: classes.listItemText}}/>
              </ListItem>
            ))
          }
          </div>
          <Menu
            open={this.state.showMenu}
            onClose={() => this.setState({ showMenu: false, menuPos: {xPos: 0, yPos: 0}, modalInfo: {} })}
            anchorReference="anchorPosition"
            anchorPosition={{ top: this.state.menuPos.yPos, left: this.state.menuPos.xPos }}
          >
            <MenuItem onClick={() => this.menuItemClick("Duplicate")}>Duplicate</MenuItem>
            {this.state.editable ? <MenuItem onClick={() => this.menuItemClick("EditInfo")}>Edit Info</MenuItem> : <div/> }
            {this.state.modalInfo.owner ? <MenuItem onClick={() => this.menuItemClick("Delete")}>Delete</MenuItem> : <div/>}
          </Menu>
        </List>

      </Paper>
    )
  }
}

export default withStyles(styles)(Sidebar);
