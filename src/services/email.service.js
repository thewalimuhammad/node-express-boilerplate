const dotenv = require('dotenv');
const transporter = require('../config/email.config.js');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

dotenv.config();
const templatesDir = path.join(__dirname, '../templates');
const templates = {};

fs.readdirSync(templatesDir).forEach((file) => {
  const templateName = path.basename(file, '.hbs');
  const templatePath = path.join(templatesDir, file);
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  templates[templateName] = handlebars.compile(templateSource);
});

const sendSignupEmail = async (body) => {
  try {
    const template = templates['signup-email'](body);
    const mailOptions = {
      from: `"YOUR-COMPANY" ${process.env.EMAIL_FROM}`,
      to: body.email,
      subject: 'Verify your email',
      html: template,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendForgotEmail = async (body) => {
  try {
    const template = templates['forget-password'](body);
    const mailOptions = {
      from: `"YOUR-COMPANY" ${process.env.EMAIL_FROM}`,
      to: body.email,
      subject: 'Reset your password',
      html: template,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendUpdateEmail = async (body) => {
  try {
    const template = templates['update-email'](body);
    const mailOptions = {
      from: `"YOUR-COMPANY" ${process.env.EMAIL_FROM}`,
      to: body.email,
      subject: 'Update your email',
      html: template,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendUpdatePasswordEmail = async (body) => {
  try {
    const template = templates['update-password'](body);
    const mailOptions = {
      from: `"YOUR-COMPANY" ${process.env.EMAIL_FROM}`,
      to: body.email,
      subject: 'Update your password',
      html: template,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {
  sendSignupEmail,
  sendForgotEmail,
  sendUpdateEmail,
  sendUpdatePasswordEmail,
};
