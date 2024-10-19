const User = require('../models/User');
const atob = require('atob');

const basicAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const [scheme, credentials] = authHeader.split(' ');

  if (scheme !== 'Basic' || !credentials) {
    return res.status(401).json({ message: 'Invalid Authorization header format' });
  }

  const decodedCredentials = atob(credentials);
  const [username, password] = decodedCredentials.split(':');

  try {
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = basicAuth;
