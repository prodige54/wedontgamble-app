const express = require('express');
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/file', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename, path: `/uploads/${req.file.filename}` });
});

router.get('/files', auth, (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.join(__dirname, '..', 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot list files' });
    res.json(files);
  });
});

module.exports = router;
