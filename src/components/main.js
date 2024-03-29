import React, { Component } from 'react';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import MoveSongsIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Avatar from '@material-ui/core/Avatar';
import Checkbox from '@material-ui/core/Checkbox';
import DeletePlaylistIcon from '@material-ui/icons/Delete';
import DeleteSongsIcon from '@material-ui/icons/DeleteSweep';
import Divider from '@material-ui/core/Divider';
import HeartIcon from '@material-ui/icons/Favorite';
import DotIcon from '@material-ui/icons/FiberManualRecord';
import DuplicatePlaylistIcon from '@material-ui/icons/FileCopy';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import SearchSongsIcon from '@material-ui/icons/Search';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import Loading from './loading';
import PlaylistModel from './modal';
import Menu from './menu';

const styles = theme => ({
  paper: {
    backgroundColor: "transparent",
    width: "90vw",
    height: "100vh",
    minWidth: "900px",
    minHeight: "500px",
  },
  rootTableContainer: {
    height: "100%"
  },
  infoPaper: {
    backgroundColor: "#16191d",
    minHeight: "200px",
    height: "20%",
    color: "white",
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    padding: "0px 20px 0px"
  },
  playlistImage: {
    height: "150px",
    width: "150px",
    marginRight: "30px",
    fontSize: "100px"
  },
  likedSongsImage: {
    backgroundColor: "#1db954",
    height: "150px",
    width: "150px",
    marginRight: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: {
    height: "4em",
    width: "4em",
  },
  playlistInfoContainer: {
    width: "calc(100% - 180px)"
  },
  playlistInfo: {
    fontWeight: "bold"
  },
  infoPC: {
    display: "flex"
  },
  dotPC: {
    fontSize: "0.6rem",
    margin: "0px 3px",
    fill: "#1db954"
  },
  playlistTitle: {
    fontWeight: "bold",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    width: "100%"
  },
  playlistClickTitle: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    "&:hover": {
      cursor: "pointer"
    }
  },
  playlistDescription: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    width: "100%"
  },
  dot: {
    fill: "#1db954",
    width: "0.5em",
    height: "0.5em",
    margin: "0px 5px"
  },
  toolBar: {
    color: "white",
    backgroundColor: "#16191d",
    width: "100%",
    height: "60px"
  },
  divider: {
    margin: "0px 20px 5px",
    backgroundColor: "rgba(255, 255, 255, 0.35)"
  },
  tools: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
  },
  toolBarButton: {
    marginLeft: "5px",
    color: "white",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)"
    },
  },
  horizantalDivider: {
    backgroundColor: "white",
    height: "24px",
    margin: "12px 11px 0px 16px"
  },
  noSongsArrowUp: {
    color: "white",
    position: "relative",
    left: "151px",
    animation: `$MoveUpDown 1s linear infinite`,
  },
  noSongsArrowUpLS: {
    color: "white",
    position: "relative",
    left: "98px",
    animation: `$MoveUpDown 1s linear infinite`,
  },
  "@keyframes MoveUpDown": {
    "0%, 100%": {
      transform: "translateY(0)"
    },
    "50%": {
      transform: "translateY(30px)"
    }
  },
  noSongs: {
    color: "white",
    width: "100%",
    height: "calc(100% - 260px)",
    minWidth: "900px",
    minHeight: "500px",
    margin: "0px",
    display: "flex",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  headerColor: {
    backgroundColor: "#21252b",
    color: "white",
    borderBottom: "1px solid rgba(255, 255, 255, 0.25)"
  },
  rootSortLabel: {
    "&:focus": {
      color: "white"
    },
    "&:hover": {
      color: "white",
      "& .icon": {
        color: "white"
      }
    },
    "&$active": {
      color: "white",
      "&& $icon": {
        color: "white",
      },
    },
  },
  active: {
    color: "white",
  },
  icon: {
    color: "white",
  },
  rootTableRow: {
    "&$hover:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    "&$selected, &$selected:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.35)",
    },
  },
  hover: {
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
  selected: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  tableCell: {
    color: "white",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
  },
  colorSecondaryCheckbox: {
    "&:hover": {
      backgroundColor: "#d5d5d5",
    },
    "&$checked": {
      color: "white",
      "&:hover": {
        backgroundColor: "#d5d5d5",
      },
    },
  },
  checked: {
  },
  titleCell: {
    display: "flex",
    flexDirection: "row"
  },
  songTitle: {
    margin: "auto 0 auto 16px"
  }
});

// Array of objects of the column headers
const headCells = [
  { id: 'Id', numeric: true, disablePadding: false, label: '#' },
  { id: 'Title', numeric: false, disablePadding: false, label: 'TITLE' },
  { id: 'Album', numeric: false, disablePadding: false, label: 'ALBUM' },
  { id: 'Artist', numeric: false, disablePadding: false, label: 'ARTIST' },
  { id: 'Length', numeric: true, disablePadding: false, label: 'LENGTH' },
  { id: 'Date Added', numeric: false, disablePadding: true, label: 'DATE ADDED' },
];

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlistItems: [],
      playlistItemUris: [],
      orderBy: 'Id',
      order: 'asc',
      checked: [],
      showModal: false,
      modalInfo: {},
      update: false,
      loading: true,
      showMoveToMenu: false,
      menuButtonElement: null
    }
  }

  // If the playlist seleceted changes then update
  componentDidUpdate(prevProps) {
    if (this.props.playlistId !== prevProps.playlistId || this.state.update === true) {
      this.setState({
        playlistItems: [],
        orderBy: 'Id',
        order: 'asc',
        checked: [],
        showModal: false,
        modalInfo: {},
        update: false,
        loading: true,
        showMoveToMenu: false,
        menuButtonElement: null
      })
      if (this.props.playlistId === "Liked Songs") {
        this.getSavedItems(0)
      }
      else {
        this.getPlaylistItems(0)

      }
    }
  }

  // Request to get all the songs of the selected palylist
  async getPlaylistItems(offset) {
    for (let i = 0; true; i = i + 100) {
      let next = true
      await axios.get('/playlist/playlist_items', {params: {access_token: this.props.userToken, playlist_id: this.props.playlistId, offset: i}})
        .then(res => {
          let songs = res.data.items
          songs.forEach((item, index) => {
            item.song_number = i + index
          })
          this.setState(state => ({
            playlistItems: state.playlistItems.concat(songs)
          }));
          if (res.data.next == null) {
            next = false
          }
        })
        .catch(error => {console.log(error); this.props.alertError();})

        if (!next) break
    }

    this.setState({ loading: false })
  }

  // Request to get all of the user's saved songs
  async getSavedItems(offset) {
    for (let i = 0; true; i = i + 50) {
      let next = true
      await axios.get('/playlist/saved_items', {params: {access_token: this.props.userToken, offset: i} })
        .then(res => {
          let songs = res.data.items
          songs.forEach((item, index) => {
            item.song_number = i + index
          })
          this.setState(state => ({
            playlistItems: state.playlistItems.concat(songs)
          }));
          if (res.data.next == null) {
            next = false
          }
        })
        .catch(error => {console.log(error); this.props.alertError();})

        if (!next) break
    }

    this.setState({ loading: false })
  }

  // Sort the songs based on the column header that is clicked
  sortSongs = id => {
    let newDirection = this.state.orderBy !== id ? 'asc' : this.state.order === 'asc' ? 'desc' : 'asc'
    this.setState({ playlistItemUris: [], orderBy: id, order: newDirection, loading: true })

    switch(id) {
      case 'Id':
        this.setState({ playlistItems: this.state.playlistItems.reverse() })
        break;
      case 'Title':
        this.state.playlistItems.sort(
          function(a, b) {
            return a.track.name.localeCompare(b.track.name)
          }
        )
        break;
      case 'Album':
        this.state.playlistItems.sort(
          function(a, b) {
            return a.track.album.name.localeCompare(b.track.album.name)
          }
        )
        break;
      case 'Artist':
        this.state.playlistItems.sort(
          function(a, b) {
            if (a.track.artists[0].name.localeCompare(b.track.artists[0].name) === 0) {
              if (a.track.artists.length - b.track.artists.length === 0) {
                for (let i = 1; i < a.track.artists.length; i++) {
                  if (a.track.artists[i].name.localeCompare(b.track.artists[i].name) === 0) {
                    continue
                  }
                  return a.track.artists[i].name.localeCompare(b.track.artists[i].name)
                }
              }
              return a.track.artists.length - b.track.artists.length
            }
            return a.track.artists[0].name.localeCompare(b.track.artists[0].name)
          }
        )
        break;
      case 'Duration':
        this.state.playlistItems.sort(
          function(a, b) {
            return a.track.duration_ms - b.track.duration_ms
          }
        )
        break;
      case 'Date Added':
        this.state.playlistItems.sort(
          function(a, b) {
            let aDate = new Date(Date.parse(a.added_at))
            let bDate = new Date(Date.parse(b.added_at))

            if (aDate > bDate) {
              return 1
            } else if (aDate < bDate){
              return -1
            } else {
              return 0
            }
          }
        )
        break;
      default:

    }

    if (newDirection === 'desc' && id !== 'Id') {
      this.setState({ playlistItems: this.state.playlistItems.reverse() })
    }

    this.getAllUris()
  }

  // Get all the uris of the new sorted list of songs
  getAllUris () {
    this.state.playlistItems.forEach((item, i) => {
      this.setState(previousState => ({
          playlistItemUris: [...previousState.playlistItemUris, item.track.uri]
      }))
    })
    this.clearPlaylistOfSongs()
  }

  // Clears the playlist of all songs
  async clearPlaylistOfSongs () {
    await axios.put('/playlist/replace', {access_token: this.props.userToken, playlist_id: this.props.playlistId, songs: []})
        .then(() => this.addToPlaylist())
        .catch(error => {console.log(error); this.props.alertError();})
  }

  // Request to add all the songs from the ones saved in state to the selected playlist.
  async addToPlaylist() {
    for (let i = 0; i < this.state.playlistItemUris.length; i = i + 100) {
      await axios.post('/playlist/add', {access_token: this.props.userToken, playlist_id: this.props.playlistId, songs: this.state.playlistItemUris.slice(i, i + 100)})
        .catch(error => {console.log(error); this.props.alertError();})
    }
    this.setState({playlistItemUris: [], update: true})
    this.props.updatePlaylists(false)
  }

  // Function to selecte all the songs in the playlist
  handleSelectAllClick = (event) => {
    this.setState({ checked: [] })
    if (event.target.checked) {
      this.setState({ checked: this.state.playlistItems })
    }
  }

  // Function to see if a song is selected or not
  isSelected = (uri) => this.state.checked.findIndex(selected => selected.track.uri === uri)

  // Handle clicking on one of the songs
  handleClick = (event, song) => {
    const checkedIndex = this.isSelected(song.track.uri)
    let newChecked = this.state.checked;
    let inserted = false

    if (checkedIndex === -1) {
      for (let i = 0; i < this.state.checked.length; i++) {
        if (song.song_number < this.state.checked[i].song_number) {
          if (i === 0) {
            newChecked.unshift(song)
          }
          else {
            newChecked.splice(i, 0, song)
          }
          inserted = true
          break
        }
      }

      if (!inserted) {
        newChecked.push(song)
      }
    }
    else {
      newChecked.splice(checkedIndex, 1)
    }

    this.setState({ checked: newChecked })
  }

  // Read spotify's timestamp in to string.
  timestampToString(timestamp) {
    let date = new Date(Date.parse(timestamp))
    let minutes = "0" + date.getMinutes()
    let seconds = "0" + date.getSeconds()
    let hours = date.getHours() % 12 === 0 ? 12 : date.getHours() % 12
    let timeOfDay = date.getHours() < 12 ? "AM" : "PM"
    return (
      (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " +
      hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + timeOfDay
    )
  }

  // Display the edit info modal.
  openModal = type => {
    if (type === "SearchSongs") {
      this.setState({
        showModal: true,
        modalInfo: {
          ...this.props.selectedPlaylistInfo,
          modalType: type,
        }
      })
    }
    else if (type === "DeleteSongs") {
      this.setState({
        showModal: true,
        modalInfo: {
          ...this.props.selectedPlaylistInfo,
          songs: this.state.checked,
          modalType: type,
          userId: this.props.userId
        }
      })
    }
    else if (this.props.playlistId === "Liked Songs" && type === "Delete") {
      this.setState({
        showModal: true,
        modalInfo: {
          ...this.props.selectedPlaylistInfo,
          songs: this.state.playlistItems,
          modalType: type,
          userId: this.props.userId
        }
      })
    }
    else {
      this.setState({
        showModal: true,
        modalInfo: {
          ...this.props.selectedPlaylistInfo,
          modalType: type,
          userId: this.props.userId
        }
      })
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <Paper square className={classes.paper}>
        <Loading isLoading={this.state.loading}/>
        <PlaylistModel
          open={this.state.showModal}
          closeModal={() => this.setState({ showModal: false, modalInfo: {} })}
          accessToken={this.props.userToken}
          modalInfo={this.state.modalInfo}
          updatePlaylists={this.props.updatePlaylists}
          updatePlaylistSongs={() => this.setState({ update: true })}
          isLoading={loadingONorOFF => this.setState({ loading: loadingONorOFF})}
          alertError={this.props.alertError}
        />
        <TableContainer classes={{root: classes.rootTableContainer}}>
          {this.props.playlistId === "Liked Songs" ?
            <Paper square className={classes.infoPaper}>
              <div className={classes.likedSongsImage}>
                <HeartIcon className={classes.heartIcon}/>
              </div>
              <div>
                <Typography variant="h3" className={classes.playlistInfo}>
                  Liked Songs
                </Typography>
                <Typography variant="body1" gutterBottom className={classes.playlistInfo}>
                  {this.props.displayName}
                  <DotIcon classes={{root: classes.dot}}/>
                  {this.state.playlistItems.length} Songs
                </Typography>
              </div>
            </Paper>
            :
            <Paper square className={classes.infoPaper}>
              {this.props.selectedPlaylistInfo.images && this.props.selectedPlaylistInfo.images.length !== 0 ?
                <img src={this.props.selectedPlaylistInfo.images[0].url} alt="Playlist" className={classes.playlistImage}/>
                :
                <Avatar variant='square' className={classes.playlistImage}>
                  {this.props.selectedPlaylistInfo.name ? this.props.selectedPlaylistInfo.name[0] : ""}
                </Avatar>
              }
              <div className={classes.playlistInfoContainer}>
                <Typography variant="caption" display="block" gutterBottom className={classes.infoPC}>
                  {this.props.selectedPlaylistInfo.editable ?
                    <div>
                      {this.props.selectedPlaylistInfo.public ? "PUBLIC" : "PRIVATE"}
                      {this.props.selectedPlaylistInfo.collaborative ? <DotIcon className={classes.dotPC}/> : ""}
                    </div>
                  :
                    <div/>}
                  {this.props.selectedPlaylistInfo.collaborative ? "COLLABORATIVE" : ""}
                </Typography>
                <Typography variant="h3" className={classes.playlistTitle}>
                  {this.props.selectedPlaylistInfo.editable ?
                    <Tooltip title="Edit Playlist Info">
                      <div onClick={() => this.openModal("EditInfo")} className={classes.playlistClickTitle}>
                        {this.props.selectedPlaylistInfo.name}
                      </div>
                    </Tooltip>
                  :
                    this.props.selectedPlaylistInfo.name}
                </Typography>
                <Typography variant="body2" gutterBottom className={classes.playlistDescription}>
                  {this.props.selectedPlaylistInfo.description}
                </Typography>
                <Typography variant="body1" gutterBottom className={classes.playlistInfo}>
                  {this.props.selectedPlaylistInfo.owner && this.props.selectedPlaylistInfo.owner.display_name}
                  <DotIcon classes={{root: classes.dot}}/>
                  {this.state.playlistItems.length} Songs
                </Typography>
              </div>
            </Paper>
          }

          <Paper className={classes.toolBar}>
            <Divider className={classes.divider}/>
            <div className={classes.tools}>
              {this.props.playlistId === "Liked Songs" && this.state.playlistItems.length === 0 ?
                <div />
              :
                <Tooltip title="Delete Playlist">
                  <IconButton aria-label="delete" onClick={() => this.openModal("Delete")} className={classes.toolBarButton}>
                    <DeletePlaylistIcon/>
                  </IconButton>
                </Tooltip>
              }
              <Tooltip title="Duplicate Playlist">
                <IconButton aria-label="Duplicate" onClick={() => this.openModal("Duplicate")} className={classes.toolBarButton}>
                  <DuplicatePlaylistIcon/>
                </IconButton>
              </Tooltip>
              {this.props.selectedPlaylistInfo.editable || this.props.playlistId === "Liked Songs" ?
                <div className={classes.tools}>
                  <Divider orientation="vertical" variant="middle" flexItem className={classes.horizantalDivider}/>
                  <Tooltip title="Search for Songs">
                    <IconButton aria-label="Search" onClick={() => this.openModal("SearchSongs")} className={classes.toolBarButton}>
                      <SearchSongsIcon/>
                    </IconButton>
                  </Tooltip>
                  {this.state.checked.length ?
                    <div>
                      <Tooltip title="Move to">
                        <IconButton
                          aria-label="move"
                          onClick={event => this.setState({ showMoveToMenu: true, menuButtonElement: event.currentTarget })}
                          className={classes.toolBarButton}
                        >
                          <MoveSongsIcon/>
                        </IconButton>
                      </Tooltip>
                      <Menu
                        open={this.state.showMoveToMenu}
                        closeMenu={() => this.setState({ showMoveToMenu: false, menuButtonElement: null })}
                        anchorEl={this.state.menuButtonElement}
                        accessToken={this.props.userToken}
                        updatePlaylists={this.props.updatePlaylists}
                        updatePlaylistSongs={() => this.setState({ update: true })}
                        isLoading={loadingONorOFF => this.setState({ loading: loadingONorOFF})}
                        alertError={this.props.alertError}
                        currentPlaylistId={this.props.playlistId}
                        playlists={this.props.playlists}
                        userId={this.props.userId}
                        songs={this.state.checked}
                        editable={this.props.selectedPlaylistInfo.editable || this.props.playlistId === "Liked Songs"}
                      />
                      <Tooltip title="Delete Songs">
                        <IconButton aria-label="delete" onClick={() => this.openModal("DeleteSongs")} className={classes.toolBarButton}>
                          <DeleteSongsIcon/>
                        </IconButton>
                      </Tooltip>
                    </div>
                  :
                    <div/>
                  }
                </div>
              :
              <div>
                {this.state.checked.length ?
                  <div className={classes.tools}>
                    <Divider orientation="vertical" variant="middle" flexItem className={classes.horizantalDivider}/>
                    <Tooltip title="Move to">
                      <IconButton
                        aria-label="move"
                        onClick={event => this.setState({ showMoveToMenu: true, menuButtonElement: event.currentTarget })}
                        className={classes.toolBarButton}
                      >
                        <MoveSongsIcon/>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      open={this.state.showMoveToMenu}
                      closeMenu={() => this.setState({ showMoveToMenu: false, menuButtonElement: null })}
                      anchorEl={this.state.menuButtonElement}
                      accessToken={this.props.userToken}
                      updatePlaylists={this.props.updatePlaylists}
                      updatePlaylistSongs={() => this.setState({ update: true })}
                      isLoading={loadingONorOFF => this.setState({ loading: loadingONorOFF})}
                      alertError={this.props.alertError}
                      currentPlaylistId={this.props.playlistId}
                      playlists={this.props.playlists}
                      userId={this.props.userId}
                      songs={this.state.checked}
                      editable={this.props.selectedPlaylistInfo.editable || this.props.playlistId === "Liked Songs"}
                    />
                  </div>
                :
                  <div/>
                }
              </div>
              }
            </div>
          </Paper>

          {this.state.playlistItems.length === 0 ?
            <div>
              <ArrowUpwardIcon className={this.props.playlistId === "Liked Songs" ? classes.noSongsArrowUpLS : classes.noSongsArrowUp}/>
              <h2 className={classes.noSongs}>
                There are no songs in this playlist. <br/> To search for songs to add to this playlist click to the magnifing glass above. <br/>
              </h2>
            </div>
            :
            <Table stickyHeader size='medium'>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" classes={{stickyHeader: classes.headerColor}}>
                    <Checkbox
                      indeterminate={0 < this.state.checked.length && this.state.checked.length < this.state.playlistItems.length}
                      checked={this.state.checked.length === this.state.playlistItems.length}
                      onChange={event => this.handleSelectAllClick(event)}
                      classes={{root: classes.icon, colorSecondary: classes.colorSecondaryCheckbox, checked: classes.checked}}
                    />
                  </TableCell>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.numeric ? 'right' : 'left'}
                      padding={headCell.disablePadding ? 'none' : 'default'}
                      sortDirection={this.state.orderBy === headCell.id ? this.state.order : false}
                      classes={{stickyHeader: classes.headerColor}}
                    >
                      {this.props.selectedPlaylistInfo.editable ?
                          <TableSortLabel
                            active={this.state.orderBy === headCell.id}
                            direction={this.state.orderBy === headCell.id ? this.state.order : 'asc'}
                            onClick={() => this.sortSongs(headCell.id)}
                            classes={{root: classes.rootSortLabel, active: classes.active, icon: classes.icon}}
                          >
                            {headCell.label}
                          </TableSortLabel>
                        :
                          <div>
                            {headCell.label}
                          </div>
                      }
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.playlistItems.map((row, index) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      key={index + ": " + row.track.id}
                      selected={this.isSelected(row.track.uri) !== -1}
                      onClick={event => this.handleClick(event, row)}
                      classes={{root: classes.rootTableRow, hover: classes.hover, selected: classes.selected}}
                    >
                      <TableCell padding="checkbox" className={classes.tableCell}>
                        <Checkbox
                          checked={this.isSelected(row.track.uri) !== -1}
                          classes={{root: classes.icon, colorSecondary: classes.colorSecondaryCheckbox, checked: classes.checked}}
                        />
                      </TableCell>
                      <TableCell align="right" className={classes.tableCell}>{index+1}</TableCell>
                      <TableCell classes={{root: classes.titleCell}} className={classes.tableCell}>
                        <Avatar variant='square' alt={row.track.album.name} src={row.track.album.images[row.track.album.images.length - 1].url} />
                        <div className={classes.songTitle}>
                          {row.track.name}
                        </div>
                      </TableCell>
                      <TableCell className={classes.tableCell}>{row.track.album.name}</TableCell>
                      <TableCell className={classes.tableCell}>
                        {
                          row.track.artists.map(artist => {
                            return (
                              artist.name
                            )
                          }).join(", ")
                        }
                      </TableCell>
                      <TableCell align="right" className={classes.tableCell}>
                        {Math.floor(row.track.duration_ms / 60000) + ":" + ("0" + Math.floor((row.track.duration_ms % 60000) / 1000)).substr(-2)}
                      </TableCell>
                      <TableCell className={classes.tableCell}>{this.timestampToString(row.added_at)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          }
        </TableContainer>
      </Paper>
    )
  }
}

export default withStyles(styles)(Main);
