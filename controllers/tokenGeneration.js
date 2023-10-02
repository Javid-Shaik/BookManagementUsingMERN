const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const secret_key = process.env.SESSION_SECRET;

// Define a function to generate and send a token response
function sendTokenResponse(user, res) {
  // Create a payload for the JWT token
  const payload = {
    user: {
      id: user.id,
      username: user.username,
      // Add any other user information you want to include in the token
    },
  };

  // Sign the token with a secret key and an expiration time
  jwt.sign(
    payload,
    secret_key, // Replace with your secret key
    { expiresIn: 3600 }, // Set the expiration time as needed
    (err, token) => {
      if (err) throw err;
      // Send the token as a JSON response
      res.json({ token });
    }
  );
}

module.exports = sendTokenResponse;
