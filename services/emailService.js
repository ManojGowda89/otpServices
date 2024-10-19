const nodemailer = require('nodemailer');

const setupNodemailerTransporter = (user) => {
  let transporterConfig;

  switch (user.emailService.service) {
    case 'gmail':
      transporterConfig = {
        service: 'gmail',
        auth: {
          user: user.emailService.auth.user,
          pass: user.emailService.auth.pass,
        }
      };
      break;
    case 'hotmail':
      transporterConfig = {
        service: 'hotmail',
        auth: {
          user: user.emailService.auth.user,
          pass: user.emailService.auth.pass,
        }
      };
      break;
    case 'yahoo':
      transporterConfig = {
        service: 'yahoo',
        auth: {
          user: user.emailService.auth.user,
          pass: user.emailService.auth.pass,
        }
      };
      break;
    default:
      throw new Error('Unsupported email service for nodemailer');
  }

  return nodemailer.createTransport(transporterConfig);
};

module.exports = setupNodemailerTransporter;
