const mongoose = require('mongoose');
const { OTP_EXPIRY } = require('../constant');

const RefreshTokenModel = new mongoose.Schema(
  {
    token: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenModel);

module.exports = RefreshToken;
