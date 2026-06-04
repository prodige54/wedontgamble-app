const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({ name, email, password, verificationToken });
    user.isVerified = true;   // <-- ADD THIS LINE
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${verificationToken}`;
    // await sendEmail(email, 'Verify your email', `<a href="${verifyUrl}">Verify</a>`);   // <-- COMMENT THIS LINE

    res.status(201).json({ message: 'User created, check email to verify' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/verify', async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ verificationToken: token });
  if (!user) return res.status(400).json({ error: 'Invalid token' });
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  res.json({ message: 'Email verified, you can now login' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ error: 'Invalid credentials' });
  if (!user.isVerified) return res.status(401).json({ error: 'Please verify your email' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
});

router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset?token=${token}`;
  await sendEmail(email, 'Reset password', `<a href="${resetUrl}">Reset</a>`);
  res.json({ message: 'Reset link sent' });
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({ name, email, password, verificationToken });
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${verificationToken}`;
    await sendEmail(email, 'Verify your email', `<a href="${verifyUrl}">Verify</a>`);

    res.status(201).json({ message: 'User created, check email to verify' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
