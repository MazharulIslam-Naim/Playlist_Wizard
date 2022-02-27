import React, { Component } from 'react';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuMUI from '@material-ui/core/Menu';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  menuPaper: {
    overflow: "auto",
    padding: "15px"
  },
  menuList: {
    display: "flex",
    flexDirection: "column",
    alignContent: "center"
  },
  menuTitle: {
    margin: "0px"
  },
  newPlaylistContainer: {
    display: "flex",
    alignItems: "flex-end",
    padding: "8px 0px"
  },
  newPlaylistCheckbox: {
    padding: "9px 9px 0px 0px"
  },
  newPlaylistTextField: {
    width: "100%"
  },
  playlistButton: {
    padding: "8px 0px"
  },
  checkboxContainer: {
    minWidth: "33px"
  },
  checkbox: {
    padding: "9px 9px 9px 0px",
  },
  allAvatar: {
    backgroundColor: "white",
    color: "white"
  },
  likedSongsAvatar: {
    backgroundColor: "#1db954"
  },
  moveButton: {
    backgroundColor: "#4fe383",
    '&:hover': {
      backgroundColor: "#38e073",
    },
  }
});

class Menu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlistsToMoveTo: [],
      newPlaylistName: "",
      deleteFromCurrent: false,
      editablePlaylists: [],
      songUris: [],
      songIds: []
    }
  }

  // When the menu opens, figure out which playlists you can add songs to. When menu is closed, clear the state.
  componentDidUpdate(prevProps) {
    if (prevProps.open == false && this.props.open == true) {
      let editablePlaylists = []
      if (this.props.currentPlaylistId != "Liked Songs") {
        editablePlaylists.push({id: "Liked Songs", name: "Liked Songs" })
      }
      this.props.playlists.forEach(playlist => {
        if (playlist.id != this.props.currentPlaylistId && (playlist.collaborative || playlist.owner.id == this.props.userId)) {
          editablePlaylists.push(playlist)
        }
      })
      this.setState({ editablePlaylists: editablePlaylists })
    }
    else if (prevProps.open == true && this.props.open == false) {
      this.setState({ playlistsToMoveTo: [], newPlaylistName: "", deleteFromCurrent: false, editablePlaylists: [], songUris: [], songIds: [] })
    }
  }

  // Function to select all the songs in the playlist
  handleSelectAllClick = (event) => {
    if (event.target.checked) {
      let allPlaylistIds = []
      this.state.editablePlaylists.forEach(playlist => {
        allPlaylistIds.push(playlist.id)
      })
      this.setState({ playlistsToMoveTo: allPlaylistIds })
      return
    }
    this.setState({ playlistsToMoveTo: [] })
  }

  // Function to see if a song is selected or not
  isSelected = uri => this.state.playlistsToMoveTo.indexOf(uri)

  // Handle clicking on one of the songs
  handleClick = (uri) => {
    const checkedIndex = this.isSelected(uri)

    if (checkedIndex == -1) {
      this.setState({ playlistsToMoveTo: this.state.playlistsToMoveTo.concat([uri]) })
    }
    else {
      let newList = this.state.playlistsToMoveTo
      newList.splice(checkedIndex, 1)
      this.setState({playlistsToMoveTo: newList})
    }
  }

  getAllSongIdsUris = () => {
    this.props.isLoading(true)
    let songUris = this.props.songs.map((item, i) => {
      return item.track.uri
    })

    let songIds = this.props.songs.map((item, i) => {
      return item.track.id
    })

    this.setState({songUris: songUris, songIds: songIds }, this.addToPlaylists)
  }

  // Go through all the selected playlists and add the songs to them.
  addToPlaylists() {
    if (this.state.newPlaylistName) {
      this.createNewPlaylist()
    }

    this.state.playlistsToMoveTo.forEach(id => {
      if (id == "Liked Songs") {
        this.addToSavedSongs()
      }
      else {
        this.addToPlaylist(id)
      }
    })

    if (this.state.deleteFromCurrent) {
      this.deleteSongs()
    }

    setTimeout(() => {
      this.props.isLoading(false)
      this.props.closeMenu()
      this.props.updatePlaylistSongs()
      this.props.updatePlaylists(false)
    }, 3000)
  }

  createNewPlaylist() {
    axios.post('/playlist/new', {access_token: this.props.accessToken, user_id: this.props.userId, name: this.state.newPlaylistName})
      .then(res => {
        this.addToPlaylist(res.data.id)
      })
      .catch(error => {console.log(error); this.props.alertError();})
  }

  // Makes requests to the backend to add each song to the user's saved songs.
  addToSavedSongs() {
    for (var i = 0; i < this.state.songIds.length; i=i+50) {
      axios.put('/playlist/saved_items', {access_token: this.props.accessToken, songs: this.state.songIds.slice(i, i+50)})
        .catch(error => {console.log(error); this.props.alertError();})
    }
  }

  // Makes requests to the backend to add each song to the playlist.
  addToPlaylist(playlistId) {
    for (var i = 0; i < this.state.songUris.length; i=i+50) {
      axios.post('/playlist/add', {access_token: this.props.accessToken, playlist_id: playlistId, songs: this.state.songUris.slice(i, i+50)})
        .catch(error => {console.log(error); this.props.alertError();})
    }
  }

  // Makes requests to the backend to delete the selected songs from the current playlist or the user's saved songs.
  deleteSongs() {
    if (this.props.currentPlaylistId == "Liked Songs") {
      for (var i = 0; i < this.state.songIds.length; i=i+50) {
        axios.delete('/playlist/saved_items', {params: {access_token: this.props.accessToken, songs: this.state.songIds.slice(i, i+50)}})
          .catch(error => {console.log(error); this.props.alertError();})
      }
    }
    else {
      for (var i = 0; i < this.state.songUris.length; i=i+50) {
        axios.delete('/playlist/playlist_items', {params: {
          access_token: this.props.accessToken,
          playlist_id: this.props.currentPlaylistId,
          songs: this.state.songUris.slice(i, i+50)
        }})
          .catch(error => {console.log(error); this.props.alertError();})
      }
    }
  }

  onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
     e.stopPropagation()
  }


  render() {
    const { classes } = this.props;

    return (
      <MenuMUI
        id="Move-to-menu"
        open={this.props.open}
        onClose={this.props.closeMenu}
        anchorEl={this.props.anchorEl}
        classes={{paper: classes.menuPaper, list: classes.menuList}}
      >
        <h3 className={classes.menuTitle}>Move to:</h3>

        <div className={classes.newPlaylistContainer}>
          <Checkbox
            className={classes.newPlaylistCheckbox}
            disabled={this.state.newPlaylistName == ""}
            checked={Boolean(this.state.newPlaylistName)}
          />
          <TextField
            label="New Playlist Name"
            className={classes.newPlaylistTextField}
            defaultValue={this.state.newPlaylistName}
            onKeyDown={this.onKeyDown}
            onChange={e => this.setState({ newPlaylistName: e.target.value.trim() })}
          />
        </div>

        {this.props.playlists.length == 0 ?
          <div />
        :
          <ListItem
            button
            key="All"
            onClick={e => this.handleSelectAllClick(e)}
            classes={{root: classes.playlistButton}}
          >
            <ListItemIcon className={classes.checkboxContainer}>
              <Checkbox checked={this.state.editablePlaylists.length == this.state.playlistsToMoveTo.length} className={classes.checkbox}/>
            </ListItemIcon>
            <ListItemAvatar>
              <Avatar variant='square' className={classes.allAvatar}>

              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="All" />
          </ListItem>
        }

        {this.state.editablePlaylists.map((playlist, index) => {
          return (
            <ListItem
              button
              key={playlist.id}
              onClick={() => this.handleClick(playlist.id)}
              classes={{root: classes.playlistButton}}
            >
              <ListItemIcon className={classes.checkboxContainer}>
                <Checkbox checked={this.isSelected(playlist.id) != -1} className={classes.checkbox}/>
              </ListItemIcon>
              <ListItemAvatar>
                {playlist.id == "Liked Songs" ?
                  <Avatar variant='square' className={classes.likedSongsAvatar}>
                    <FavoriteIcon />
                  </Avatar>
                :
                  playlist.images.length != 0 ?
                    <Avatar variant='square' alt={playlist.name} src={playlist.images[playlist.images.length - 1].url} />
                  :
                    <Avatar variant='square'>
                      {playlist.name.[0]}
                    </Avatar>
                }
              </ListItemAvatar>
              <ListItemText primary={playlist.name} />
            </ListItem>
          )

        })}

        {this.props.editable ?
          <FormGroup>
            <FormControlLabel
              control={<Checkbox />}
              label="Delete the songs from current playlist."
              checked={this.state.deleteFromCurrent}
              onClick={e => this.setState({ deleteFromCurrent: !this.state.deleteFromCurrent })}
            />
          </FormGroup>
        :
          <div />
        }

        <Button
          variant="contained"
          disabled={this.state.playlistsToMoveTo.length == 0 && this.state.newPlaylistName == ""}
          onClick={() => this.getAllSongIdsUris()}
          classes={{root: classes.moveButton}}
        >
          Move
        </Button>
      </MenuMUI>
    )
  }
}

export default withStyles(styles)(Menu);
