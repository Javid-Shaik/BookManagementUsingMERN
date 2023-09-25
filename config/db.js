const mongoose = require('mongoose');

// Connect to MongoDB using the IPv4 loopback address or localhost
const mongoURI = 'mongodb://127.0.0.1:27017/BookManagement';

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
