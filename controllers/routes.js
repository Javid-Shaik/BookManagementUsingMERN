// Import necessary modules and models
const express = require('express');
const router = express.Router();
const User = require('../models/userSchema'); // Import your User model

// Define a route handler for the registration page (GET request)
router.get('/register', (req, res) => {
  res.render('register'); // Render the registration form (e.g., "views/register.ejs")
});

// Export the router
module.exports = router;
