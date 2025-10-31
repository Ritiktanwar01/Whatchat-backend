// src/models/auth.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobile: { type: String, unique: true, sparse: true },
  email: { type: String, required: true },
  profilePicture: { type: String, default: '/media/uploads/user.png' },
  fcmToken: { type: String, default: null }, 
  createdAt: { type: Date, default: Date.now },
  friends: { type: [String], default: [] }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
