const nodemailer = require('nodemailer');

const setupSmtpTransporter = (user) => {
  if (user.emailService.service !== 'office365') {
    throw new Error('Unsupported email service for SMTP');
  }

  return nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: user.emailService.auth.user,
      pass: user.emailService.auth.pass,
    },
    tls: {
      ciphers: 'SSLv3'
    }
  });
};

module.exports = setupSmtpTransporter;
