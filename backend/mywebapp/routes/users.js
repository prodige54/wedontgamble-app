const express = require('express');
const User = require('../models/User');
const { auth, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, isAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.put('/:id/role', auth, isAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ message: 'Role updated' });
});

module.exports = router;
