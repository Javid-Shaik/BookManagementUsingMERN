const User = require('../models/userSchema');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ userName: username }).exec();
    

    if (!user) {
      const errorMessage = "Account does not exist. Create One here..";
      return res.render('register', { errorMessage });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);


    if (!isPasswordValid) {
      const errorMessage = "Invalid username or password. Please try again..";
      return res.render('login', { errorMessage });
    }

    if (req.session && req.session.user) {
      return res.redirect('/index');
    }
  
    req.session.user = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.userName,
      profileImage: user.image,
      imagePath: user.imagePath,
      user_id: user._id,
    };

    res.redirect('/index');
  } catch (error) {
    res.status(401).render('login', { errorMessage: "Invalid Credentials" });
  }
};
