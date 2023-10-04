const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = mongoose.Schema({
    firstName :{
        type: String,
        required: true,
    },
    lastName :{
        type: String,
        required :true,
    },
    userName :{
        type:String,
        required:true,
    },
    email :{
        type:String,
        required :true,
    },
    password:{
        type:String,
        required:true,
    },
    profileImage: {
      type: Buffer, // Store the image data as a Buffer
    },
    imgPath:{
      type:String,
      required:true,
    },
    isSuperUser :{
        type:Boolean,
        default:false,
    },
    createdAt :{
        type:Date,
        default: Date.now(),
    }
});


  

const User = mongoose.model('User', userSchema);

module.exports = User;