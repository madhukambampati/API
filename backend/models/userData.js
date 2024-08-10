const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  password: { type: String ,required: true},
});

const UserRegister = mongoose.model('UserRegister', userSchema,'adminusers');

module.exports = UserRegister;
