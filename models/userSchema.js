const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    profile_img :{
        type:Buffer,
        required:false,
    }
});

userSchema.pre('save', async function (next) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  });
  
  // Compare a given password with the user's hashed password.
  userSchema.methods.comparePassword = async function (password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw error;
    }
  };
  

const User = mongoose.model('User', userSchema);

module.exports = User;