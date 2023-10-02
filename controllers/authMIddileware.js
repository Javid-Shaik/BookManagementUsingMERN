const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()


const secret_key =  process.env.SESSION_SECRET;

function verifyToken(req, res, next) {
  // Get the token from the request headers or cookies, whichever you prefer
  console.log(req.headers.authorization)
  const token = req.headers.authorization || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Verify the token
  jwt.verify(token, secret_key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Attach the user ID from the token to the request for future use
    req.userId = decoded.userId;
    next();
  });
}

module.exports = verifyToken;
