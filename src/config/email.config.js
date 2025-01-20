const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter
  .verify()
  .then(() => console.log('Email server is connected'))
  .catch(() =>
    console.error(
      'Unable to connect to email server. Make sure you have configured the SMTP options in .env',
    ),
  );

module.exports = transporter;
