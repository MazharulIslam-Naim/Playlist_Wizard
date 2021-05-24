const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  access_token: {
    type: String,
    required: true,
    trim: true,
  },
  expires_in: {
    type: Number,
    required: true,
    trim: true,
  },
  refresh_token: {
    type: String,
    required: true,
    trim: true,
  },
  expire_time: {
    type: Date,
    required: true
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
