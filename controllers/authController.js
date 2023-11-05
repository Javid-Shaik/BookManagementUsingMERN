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

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ userName: username }).exec();
    

    if (!user) {
      console.log('!User');
      const errorMessage = "Your are not authorized to enter this page";
      return res.render('./admin/adminLogin', { errorMessage });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);


    if (!isPasswordValid) {
      console.log('!password');
      const errorMessage = "Invalid username or password. Please try again..";
      return res.render('.admin/adminLogin', { errorMessage });
    } 
    if (user.isSuperUser && user.isSuperUser === true) {
      // If the user is an admin, continue to the next middleware or route handler
      // next();
      req.session.user = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.userName,
        profileImage: user.image,
        imagePath: user.imagePath,
        user_id: user._id,
      };
      res.redirect('/admin/main');
    } else {
      // If the user is not an admin, redirect to another page (e.g., 'not_admin_page')
      res.redirect('/not_admin_page');
    }

    // res.redirect('/admin');
  } catch (error) {
    res.status(401).render('./admin/adminLogin', { errorMessage: "Invalid Credentials" });
  }
};
