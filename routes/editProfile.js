// routes/editProfile.js
const express = require('express');
const router = express.Router();

// Import your User model
const User = require('../models/userSchema');

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware
    }
    // User is not authenticated, redirect to login page
    res.redirect('/login');
};

// Profile edit form route
router.get('/', isLoggedIn, (req, res) => {
    // Render the profile edit form with user data
    res.render('editProfile', { user: req.user });
});

module.exports = router;
