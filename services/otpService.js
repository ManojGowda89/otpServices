const crypto = require('crypto');
const otps = {};

const generateOtp = (email) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
  otps[email] = { otp, expiry };
  return otp;
};

const verifyOtp = (email, otp) => {
  const storedOtpData = otps[email];

  if (storedOtpData && storedOtpData.otp === otp) {
    if (Date.now() > storedOtpData.expiry) {
      delete otps[email];
      return { valid: false, message: 'otp_expired' };
    }

    delete otps[email];
    return { valid: true, message: 'otp_verified_successfully' };
  } else {
    return { valid: false, message: 'Invalid_otp' };
  }
};

module.exports = {
  generateOtp,
  verifyOtp,
};
