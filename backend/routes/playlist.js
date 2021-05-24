const router = require('express').Router();
const axios = require('axios');

// Get a list of the user's playlists. (max 50)
// Params:
// - access_token
// - offset: the index where the result array should start from
// Return:
// - playlist objects: (see spotify api reference)
router.route('/').post((req, res) => {
  axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: {Authorization: 'Bearer '+ req.body.access_token},
    params: {
      limit: 50,
      offset: req.body.offset
    },
  })
    .then(response => res.json(response.data))
    .catch(error => console.log(error))
});

// Get a list of the playlist's songs. (max 100)
// Params:
// - access_token
// - playlist_id
// - offset: the index where the result array should start from
// Return:
// - song track objects: array of tracks in the playlist
router.route('/playlist_items').post((req, res) => {
  axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/playlists/' + req.body.playlist_id + '/tracks',
    headers: {Authorization: 'Bearer '+ req.body.access_token},
    params: {
      limit: 100,
      offset: req.body.offset
    },
  })
    .then(response => res.json(response.data))
    .catch(error => console.log(error))
});

// Create a new playlist.
// Params:
// - access_token
// - user_id
// Return:
// - playlist object: (see spotify playlist object reference)
router.route('/new').post((req, res) => {
  axios({
    method: 'post',
    url: 'https://api.spotify.com/v1/users/' + req.body.user_id + '/playlists',
    headers: {
      Authorization: 'Bearer '+ req.body.access_token,
    },
    data: {
      name: req.body.name
    },
  })
    .then(response => res.json(response.data))
    .catch(error => console.log(error))
});

// Delete a playlist.
// Params:
// - access_token
// - playlist_id
router.route('/delete').post((req, res) => {
  axios({
    method: 'delete',
    url: 'https://api.spotify.com/v1/playlists/' + req.body.playlist_id + '/followers',
    headers: {
      Authorization: 'Bearer '+ req.body.access_token,
    },
  })
    .then(() => res.json('Playlist deleted.'))
    .catch(error => console.log(error))
});

// Rename a Playlist
// Params:
// - access_token
// - playlist_id
// - name
router.route('/rename').put((req, res) => {
  axios({
    method: 'put',
    url: 'https://api.spotify.com/v1/playlists/' + req.body.playlist_id,
    headers: {
      Authorization: 'Bearer '+ req.body.access_token,
      'Content-Type': 'application/json'
    },
    data: {
      name: req.body.name
    },
  })
    .then(() => res.json('Playlist renamed'))
    .catch(error => console.log(error))
});

// Add Items to a Playlist
// Params:
// - access_token
// - playlist_id
// - songs: array of songs to be added to the playlist
router.route('/add').post((req, res) => {
  axios({
    method: 'post',
    url: 'https://api.spotify.com/v1/playlists/' + req.body.playlist_id + '/tracks',
    headers: {
      Authorization: 'Bearer '+ req.body.access_token,
      'Content-Type': 'application/json'
    },
    data: {
      uris: req.body.songs
    },
  })
    .then(() => res.json('Songs added to playlist.'))
    .catch(error => console.log(error))
});



// Reorder or Replace a Playlist's Items
router.route('/replace').put((req, res) => {
  axios({
    method: 'put',
    url: 'https://api.spotify.com/v1/playlists/' + req.body.playlist_id + '/tracks',
    headers: {Authorization: 'Bearer '+ req.body.access_token},
    data: {
      uris: req.body.songs
    },
  })
    .then(() => res.json('Playlist replaced.'))
    .catch(error => console.log(error))
});

// Remove Items from a Playlist
router.route('/playlist_items').delete((req, res) => {
  axios({
    method: 'delete',
    url: 'https://api.spotify.com/v1/playlists/' + req.body.playlist_id + '/tracks',
    headers: {
      Authorization: 'Bearer '+ req.body.access_token,
      'Content-Type': 'application/json'
    },
    data: {
      uris: req.body.songs
    },
  })
    .then(() => res.json('Songs removed from playlist.'))
    .catch(error => console.log(error))
});


module.exports = router;
