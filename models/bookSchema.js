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
    type:String,
    required: true,
  },
  price :{
    type: Number,
    required:true,
  },

  published_year: Number,
  genre: [String], // This can be an array of genres.
  // Add other properties as needed.
  copies_available: Number,
  description : String,
  publisher : String,



});

// Create a Mongoose model based on the schema.
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;

