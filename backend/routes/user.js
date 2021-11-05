const router = require('express').Router();
const axios = require('axios');
const qs = require('qs');
let User = require('../models/user.model');

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;

// Get the user data from the database.
// Params:
// - email: user email
// Return:
// - user object: spotify id, email, access_token, expires_in, refresh_token, expire_time
router.route('/:email').get((req, res) => {
  User.find({ email: req.params.email })
    .then(user => res.json(user))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add the user to database.
// Params:
// - id
// - email
// - access_token
// - expires_in
// - refresh_token
// - expire_time: one minute less then the cuurent time plus expires_in
router.route('/add').post((req, res) => {
  const id = req.body.id;
  const display_name = req.body.display_name;
  const email = req.body.email;
  const access_token = req.body.access_token;
  const expires_in = Number(req.body.expires_in);
  const refresh_token = req.body.refresh_token;
  const expire_time = req.body.expire_time;

  const newUser = new User({
    id,
    display_name,
    email,
    access_token,
    expires_in,
    refresh_token,
    expire_time
  });

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update the user on the database.
// Params:
// - id
// - email
// - access_token
// - expires_in
// - refresh_token
// - expire_time: one minute less then the cuurent time plus expires_in
router.route('/update').post((req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      user.id = req.body.id;
      user.display_name = req.body.display_name;
      user.email = req.body.email;
      user.access_token = req.body.access_token;
      user.expires_in = Number(req.body.expires_in);
      user.refresh_token = req.body.refresh_token;
      user.expire_time = req.body.expire_time;

      user.save()
        .then(() => res.json('User updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get the new access token using the refresh token.
// Params:
// - refresh_token
// Return:
// - access_token: new access_token
// - expires_in
router.route('/refresh_token').post((req, res) => {
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
    grant_type: 'refresh_token',
    refresh_token: req.body.refresh_token
  };

  axios.post('https://accounts.spotify.com/api/token', qs.stringify(data), headers)
    .then(response => res.json(response.data))
    .catch(err => res.status(400).json('Error: ' + err))
});

module.exports = router;
