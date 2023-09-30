const User = require('../models/userSchema'); // Adjust the path as needed

exports.login = async (req, res) => {
    
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ userName:username }).exec();
    

    if (!user) {
        // console.log(username);
        const errorMessage = "Account does not exist. Create One here..";
      return res.render('register' ,{ errorMessage })
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        const errorMessage = "Inavlid username or password. Please try again.."
      return res.render('login', { errorMessage });
    }

    // Here, you can create a session or issue a JWT token to authenticate the user.
    // For session-based authentication, you can use req.login() as shown previously.
    if (req.session && req.session.user) {
        // User is already logged in
        return res.redirect('/index'); // Redirect to the dashboard or any other route
      }
    req.session.user = {
        firstName: user.firstName,
        lastName: user.lastName,
        email:user.email,
        username: user.userName,
        profileImage: user.image,
        imagePath : user.imagePath,

    }
    // Redirect to a user dashboard or another protected route after login
    res.redirect('/index');
  } catch (error) {
    // Handle login errors (e.g., incorrect credentials)
    res.status(401).render('login', { errorMessage:"Invalid Credentials" }); // Render the login form with an error message
  }
};
