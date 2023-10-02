const express = require('express');
const router = express.Router();
const verifyToken = require('./authMiddleware'); // Import the middleware

// Profile view endpoint (GET) with JWT middleware
router.get('/users/profile', verifyToken, (req, res) => {
  // Fetch the user's profile information from your database
  // and send it as a response
  const user = {
    email: "user@example.com",
    name: "UserName",
  };
  res.json({ success: true, user });
});

// Profile update endpoint (PUT) with JWT middleware
router.put('/users/profile', verifyToken, (req, res) => {
  // Update the user's profile information in your database
  // based on the request body
  const updatedName = req.body.name; // Assuming the request includes a 'name' field

  // You can update the user's name in the database here
  // For simplicity, we'll just return the updated data
  const updatedUser = {
    email: "user@example.com",
    name: updatedName,
  };

  res.json({ success: true, user: updatedUser });
});

module.exports = router;
