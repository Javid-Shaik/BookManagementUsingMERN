// routes/user.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Define the destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename
  },
});

const upload = multer({ storage: storage });

// Registration route
router.post('/register', upload.single('image'), async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;
    const image = req.file.filename;

    const user = new User({ firstName, lastName, email, username, password, image });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

module.exports = router;
