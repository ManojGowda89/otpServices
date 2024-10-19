const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  companyname: { type: String, required: true },
  emailService: {
    service: { type: String, required: true },
    auth: {
      user: { type: String, required: true },
      pass: { type: String, required: true }
    }
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
