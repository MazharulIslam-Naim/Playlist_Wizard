import React, { Component } from 'react';
import axios from 'axios';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';

const headCells = [
  { id: 'Id', numeric: true, disablePadding: false, label: '#' },
  { id: 'Title', numeric: false, disablePadding: true, label: 'TITLE' },
  { id: 'Album', numeric: false, disablePadding: true, label: 'ALBUM' },
  { id: 'Artist', numeric: false, disablePadding: true, label: 'ARTIST' },
  { id: 'Duration', numeric: false, disablePadding: true, label: 'DURATION' },
  { id: 'Date Added', numeric: false, disablePadding: true, label: 'DATE ADDED' },
];

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlistItems: [],
      update: false,
      orderBy: 'Id',
      order: 'asc',
      loading: false,
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.playlistId !== prevProps.playlistId || this.state.update) {
      this.setState({ update: false, playlistItems: [] })
      this.getPlaylistItems(0)

    }
  }

  getPlaylistItems(offset) {
    axios.post('http://localhost:5000/playlist/playlist_items', {access_token: this.props.user, playlist_id: this.props.playlistId, offset: offset})
      .then(res => {
        this.setState({ playlistItems: this.state.playlistItems.concat(res.data.items) })
        if (res.data.next) {
          this.getPlaylistItems(offset + 100)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  sortSongs (id) {
    if (id === 'Id') {

      // this.setState({ playlistItems: this.state.playlistItems.reverse() })

      //
      // axios.post('http://localhost:5000/playlist/new', {access_token: this.props.user, playlist_id: this.props.playlistId})
      //   .then(res => {
      //
      //
      //   })
      //   .catch((error) => {
      //     console.log(error)
      //   })
      //

    }
  }

  bubbleSort () {

  }

  mergeSort () {

  }

  render() {
    return (
      <div>
        <Paper square>
          <TableContainer>
            <Table
              aria-labelledby="playlistSongs"
              size='medium'
              aria-label="enhanced table"
            >
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={false}
                      checked={false}
                      onChange={console.log()}
                      inputProps={{ 'aria-label': 'select all songs' }}
                    />
                  </TableCell>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.numeric ? 'right' : 'left'}
                      padding={headCell.disablePadding ? 'none' : 'default'}
                      sortDirection={this.state.orderBy === headCell.id ? this.state.order : false}
                    >
                      <TableSortLabel
                        active={this.state.orderBy === headCell.id}
                        direction={this.state.orderBy === headCell.id ? this.state.order : 'asc'}
                        onClick={this.sortSongs.bind(this, headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  this.state.playlistItems.map((row, index) => {
                    return (
                      <TableRow
                        hover
                        onClick={(event) => console.log(event)}
                        role="checkbox"
                        aria-checked={false}
                        tabIndex={-1}
                        key={row.track.id}
                        selected={false}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={false}
                            inputProps={{ 'aria-labelledby': index }}
                          />
                        </TableCell>
                        <TableCell align="right">{index+1}</TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Avatar variant='square' alt={row.track.album.name} src={row.track.album.images[row.track.album.images.length - 1].url} />
                          {row.track.name}
                        </TableCell>
                        <TableCell>{row.track.album.name}</TableCell>
                        <TableCell>Artist</TableCell>
                        <TableCell>{row.track.duration_ms}</TableCell>
                        {index == 1 ? console.log() : console.log()}
                        <TableCell>{row.added_at}</TableCell>
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    )
  }
}
