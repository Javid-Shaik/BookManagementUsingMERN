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
    image :{
        type:Buffer,
        required:false,
    },
    imgPath:{
      type:String,
      required:true,
    }
});

userSchema.pre('save', async function (next) {
    try {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(this.password, salt);
      this.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  });
  
  // Compare a given password with the user's hashed password.
  userSchema.methods.comparePassword = async function (password) {
    try {
      return await bcryptjs.compare(password, this.password);
    } catch (error) {
      throw error;
    }
  };
  

const User = mongoose.model('User', userSchema);

module.exports = User;