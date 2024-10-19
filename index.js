const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require("mb64-connect")
const mblogs = require("mb64-logs");
const User = require('./models/User');
const basicAuth = require('./middleware/basicAuth');
const { generateOtp, verifyOtp } = require('./services/otpService');
const setupNodemailerTransporter = require('./services/emailService');
const setupSmtpTransporter = require('./services/smtpService');

dotenv.config();

const app = express();
const port = 3000;
mblogs(app);
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

connectDB(process.env.URI);
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error });
  }
});
app.post('/adduser', async (req, res) => {
  const { username, password, email, companyname, emailService } = req.body;

  if (!username || !password || !email || !companyname || !emailService || !emailService.auth || !emailService.auth.user || !emailService.auth.pass) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newUser = new User({ username, password, email, companyname, emailService });
    await newUser.save();
    res.json({ message: 'User added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add user', error });
  }
});

app.put('/updateuser', async (req, res) => {
  const { username, password, email, companyname, emailService } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password || user.password;
    user.email = email || user.email;
    user.companyname = companyname || user.companyname;
    user.emailService = emailService || user.emailService;

    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error });
  }
});

app.delete('/deleteuser', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const user = await User.findOneAndDelete({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error });
  }
});

app.get('/getotp', basicAuth, async (req, res) => {
  const { email } = req.query;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  const otp = generateOtp(email);

  const mailOptions = {
    user: req.user.emailService.auth.user,
    pass: req.user.emailService.auth.pass,
    to: email,
    subject: 'Your OTP Code',
    body: `Your OTP code is ${otp}. It expires in 5 minutes.`
  };

  try {
    let transporter;
    if (req.user.emailService.service === 'office365') {
      transporter = setupSmtpTransporter(req.user);
    } else {
      transporter = setupNodemailerTransporter(req.user);
    }

    await transporter.sendMail({
      from: mailOptions.user,
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.body
    });
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error });
  }
});

app.get('/verifyotp', basicAuth, (req, res) => {
  const { email, otp } = req.query;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Missing email or otp' });
  }

  const result = verifyOtp(email, otp);
  res.status(result.valid ? 200 : 400).json({ message: result.message });
});

app.post('/sendcustomemail', basicAuth, async (req, res) => {
  const { email } = req.query;
  const { subject, body } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  if (!subject || !body) {
    return res.status(400).json({ message: 'Missing subject or body' });
  }

  try {
    let transporter;
    if (req.user.emailService.service === 'office365') {
      transporter = setupSmtpTransporter(req.user);
    } else {
      transporter = setupNodemailerTransporter(req.user);
    }

    await transporter.sendMail({
      from: req.user.emailService.auth.user,
      to: email,
      subject,
      text: body
    });
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error });
  }
});

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(String(email).toLowerCase());
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
