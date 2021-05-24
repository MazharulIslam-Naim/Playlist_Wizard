const router = require('express').Router();
const axios = require('axios');
const qs = require('qs');

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;
const scope = process.env.scope;
var redirect_uri = process.env.redirect_uri;

// Returns the url to ridirect the user to login to thier spotify account and
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
router.route('/:code').get((req, res) => {
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
    code: req.params.code,
    redirect_uri: redirect_uri
  };

  axios.post('https://accounts.spotify.com/api/token', qs.stringify(data), headers)
    .then(response => res.json(response.data))
    .catch(error => console.log(error))
});

// Request current user's information from spotify.
// Params:
// access_token
// Return:
// - user object: (see spotify api reference)
router.route('/user').post((req, res) => {
  axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/me',
    headers: {Authorization: 'Bearer '+req.body.access_token},
  })
    .then(response => res.json(response.data))
    .catch(error => console.log(error))
});

module.exports = router;
