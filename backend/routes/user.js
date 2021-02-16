const router = require('express').Router();
const axios = require('axios');
const qs = require('qs');
let User = require('../models/user.model');

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;

router.route('/:email').get((req, res) => {
  User.find({ email: req.params.email })
    .then(exercise => res.json(exercise))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const email = req.body.email;
  const access_token = req.body.access_token;
  const expires_in = Number(req.body.expires_in);
  const refresh_token = req.body.refresh_token;

  const newUser = new User({
    email,
    access_token,
    expires_in,
    refresh_token,
  });

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update').post((req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      user.email = req.body.email;
      user.access_token = req.body.access_token;
      user.expires_in = Number(req.body.expires_in);
      user.refresh_token = req.body.refresh_token;

      user.save()
        .then(() => res.json('User updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/refresh_token/:refresh_token').get((req, res) => {
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
    refresh_token: req.params.refresh_token
  };

  axios.post('https://accounts.spotify.com/api/token', qs.stringify(data), headers)
    .then(response => {
      res.json(response.data)
    })
    .catch((error) => {
      console.log(error)
    })
});

module.exports = router;
