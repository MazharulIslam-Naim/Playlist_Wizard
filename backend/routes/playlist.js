const router = require('express').Router();
const axios = require('axios');

// Get a list of the user's playlists. (max 50)
// Params:
// - access_token
// - offset: the index where the result array should start from
// Return:
// - playlist objects: (see spotify api reference)
router.route('/').get((req, res) => {
  axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: {Authorization: 'Bearer ' + req.query.access_token},
    params: {
      limit: 50,
      offset: req.query.offset
    },
  })
    .then(response => res.json(response.data))
    .catch(err => res.status(400).json('Error: ' + err))
});

// Get a specified playlist's information.
// Params:
// - access_token
// - playlist_id
// Return:
// - playlist's information
router.route('/info').get((req, res) => {
  axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/playlists/' + req.query.playlist_id,
    headers: {Authorization: 'Bearer '+ req.query.access_token},
    params: {
      fields: "collaborative, description, images, name, owner(display_name, id)"
    },
  })
    .then(response => res.json(response.data))
    .catch(err => res.status(400).json('Error: ' + err))
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
      Authorization: 'Bearer ' + req.body.access_token,
    },
    data: {
      name: req.body.name
    },
  })
    .then(response => res.json(response.data))
    .catch(err => res.status(400).json('Error: ' + err))
});

// Delete a playlist.
// Params:
// - access_token
// - playlist_id
router.route('/delete').delete((req, res) => {
  axios({
    method: 'delete',
    url: 'https://api.spotify.com/v1/playlists/' + req.query.playlist_id + '/followers',
    headers: {
      Authorization: 'Bearer ' + req.query.access_token,
    },
  })
    .then(() => res.json('Playlist deleted.'))
    .catch(err => res.status(400).json('Error: ' + err))
});

// Edit a playlist's information
// Params:
// - access_token
// - playlist_id
// - name
router.route('/edit').put((req, res) => {
  const data = {}
  if (req.body.description) { data.description = req.body.description }
  data.name = req.body.name
  data.public = req.body.public
  data.collaborative = req.body.collaborative
  axios({
    method: 'put',
    url: 'https://api.spotify.com/v1/playlists/' + req.body.playlist_id,
    headers: {
      Authorization: 'Bearer ' + req.body.access_token,
      'Content-Type': 'application/json'
    },
    data: data
  })
    .then(() => res.json('Playlist info edited.'))
    .catch(err => res.status(400).json('Error: ' + err))
});

// Get the current user's saved songs. (max 50)
// Params:
// - access_token
// - offset: the index where the result array should start from
// Return:
// - song track objects: array of tracks in the 'Your Music' library
router.route('/saved_items').get((req, res) => {
  axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/me/tracks',
    headers: {
      Authorization: 'Bearer ' + req.query.access_token,
    },
    params: {
      limit: 50,
      offset: req.query.offset
    },
  })
    .then(response => res.json(response.data))
    .catch(err => res.status(400).json('Error: ' + err))
});

// Delete the songs saved in the user's saved songs. (max 50)
// Params:
// - access_token
// - songs: array of songs to be deleted from the users saved songs
router.route('/saved_items').delete((req, res) => {
  axios({
    method: 'delete',
    url: 'https://api.spotify.com/v1/me/tracks',
    headers: {Authorization: 'Bearer ' + req.query.access_token},
    params: {ids: req.query.songs.toString()},
  })
    .then(response => res.json(response.status))
    .catch(err => res.status(400).json('Error: ' + err))
});

// Add to the user's saved songs. (max 50)
// Params:
// - access_token
// - songs: array of songs to be added to the users saved songs
router.route('/saved_items').put((req, res) => {
  axios({
    method: 'put',
    url: 'https://api.spotify.com/v1/me/tracks',
    headers: {Authorization: 'Bearer ' + req.body.access_token},
    data: {
      ids: req.body.songs
    },
  })
    .then(response => res.json(response.data))
    .catch(err => res.status(400).json('Error: ' + err))
});

// Get a list of the playlist's songs. (max 100)
// Params:
// - access_token
// - playlist_id
// - offset: the index where the result array should start from
// Return:
// - song track objects: array of tracks in the playlist
router.route('/playlist_items').get((req, res) => {
  axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/playlists/' + req.query.playlist_id + '/tracks',
    headers: {Authorization: 'Bearer ' + req.query.access_token},
    params: {
      limit: 100,
      offset: req.query.offset
    },
  })
    .then(response => res.json(response.data))
    .catch(err => res.status(400).json('Error: ' + err))
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
      Authorization: 'Bearer ' + req.body.access_token,
      'Content-Type': 'application/json'
    },
    data: {
      uris: req.body.songs
    },
  })
    .then(() => res.json('Songs added to playlist.'))
    .catch(err => res.status(400).json('Error: ' + err))
});

// Reorder or Replace a Playlist's Items
// Params:
// - access_token
// - playlist_id
// - songs: array of songs to be replaced with in the playlist
router.route('/replace').put((req, res) => {
  axios({
    method: 'put',
    url: 'https://api.spotify.com/v1/playlists/' + req.body.playlist_id + '/tracks',
    headers: {Authorization: 'Bearer ' + req.body.access_token},
    data: {
      uris: req.body.songs
    },
  })
    .then(() => res.json('Playlist songs replaced.'))
    .catch(err => res.status(400).json('Error: ' + err))
});

// Remove Items from a Playlist
// Params:
// - access_token
// - playlist_id
// - songs: array of songs to be deleted from the playlist
router.route('/playlist_items').delete((req, res) => {
  axios({
    method: 'delete',
    url: 'https://api.spotify.com/v1/playlists/' + req.query.playlist_id + '/tracks',
    headers: {
      Authorization: 'Bearer ' + req.query.access_token,
      'Content-Type': 'application/json'
    },
    data: {
      uris: req.query.songs
    },
  })
    .then(() => res.json('Songs removed from playlist.'))
    .catch(err => res.status(400).json('Error: ' + err))
});


module.exports = router;
