const crypto = require('crypto');

function generateOTP() {
  return crypto.randomInt(1000, 9999);
}

module.exports = generateOTP;
