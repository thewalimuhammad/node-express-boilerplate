const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Role = require('../constant');

const userModel = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, match: /.+\@.+\..+/ },
    password: {
      type: String,
      required: true,
      set: (password) => bcrypt.hashSync(password, 10),
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(Role),
      default: Role.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userModel);
module.exports = User;
