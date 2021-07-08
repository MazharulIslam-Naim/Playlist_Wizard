const router = require('express').Router();
const axios = require('axios');
const qs = require('qs');

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;
const scope = process.env.scope;
var redirect_uri = process.env.redirect_uri;

// Returns the url to redirect the user to login to their spotify account and
// allow access to the app.
// Return:
// - url: url to redirect to
router.route('/').get((req, res) => {
  var url = 'https://accounts.spotify.com/authorize' +
  '?response_type=code' +
  '&client_id=' + client_id +
  (scope ? '&scope=' + encodeURIComponent(scope) : '') +
  '&redirect_uri=' + encodeURIComponent(redirect_uri)

  res.json(url)
});

// Request access and refresh token from spotify
// Prams:
// - code: The authorization code returned from the initial request to the Account /authorize endpoint.
// Return:
// - access_token
// - expires_in: The time period (in seconds) for which the access token is valid.
// - refresh_token
router.route('/code').post((req, res) => {
  const headers = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: client_id,
      password: client_secret,
    },
  };
  const data = {
    grant_type: 'authorization_code',
    code: req.body.code,
    redirect_uri: redirect_uri
  };

  axios.post('https://accounts.spotify.com/api/token', qs.stringify(data), headers)
    .then(response => res.json(response.data))
    .catch(err => res.status(400).json('Error: ' + err))
});

// Request current user's information from spotify.
// Params:
// access_token
// Return:
// - user object: (see spotify api reference)
router.route('/user').get((req, res) => {
  axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/me',
    headers: {Authorization: 'Bearer ' + req.query.access_token},
  })
    .then(response => res.json(response.data))
    .catch(err => res.status(400).json('Error: ' + err))
});

module.exports = router;
