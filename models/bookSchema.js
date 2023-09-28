const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  isbn:{
    type:String,
    required: true,
    
  },
  
  cover_image:{
    type:Buffer,
    required: true,
  },

  publishedYear: Number,
  genre: [String], // This can be an array of genres.
  // Add other properties as needed.
});

// Create a Mongoose model based on the schema.
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
