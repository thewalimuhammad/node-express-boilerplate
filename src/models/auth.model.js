const mongoose = require('mongoose');
const { OTP_EXPIRY } = require('../constant');

const AuthModel = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    otp: { type: Number },
    expiresAt: {
      type: Date,
      default: () => Date.now() + OTP_EXPIRY * 1000,
    },
  },
  { timestamps: true },
);

AuthModel.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Auth = mongoose.model('Auth', AuthModel);

module.exports = Auth;
