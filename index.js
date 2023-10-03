const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      // Step 1: Retrieve a user based on the provided username
      const user = await User.findOne({ username });

      // Step 2: Check the username and password
      if (!user) {
        // Authentication failed: User not found
        return done(null, false, { message: 'Incorrect username or password' });
      }

      // Use a library like bcrypt to compare the provided password with the stored hash
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        // Authentication failed: Incorrect password
        return done(null, false, { message: 'Incorrect username or password' });
      }

      // Authentication successful: Pass the user object to serializeUser
      return done(null, user);
    } catch (error) {
      // Handle any errors that occur during authentication
      return done(error);
    }
  }
));


// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Retrieve the user from your user database based on `id`
  User.findById(id, (err, user) => {
    if (err) {
      return done(err);
    }
    done(null, user);
  });

});


const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const User = require('./models/userSchema');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authController = require('./controllers/authController');
const sendTokenResponse = require('./controllers/tokenGeneration');
const router  = require('./controllers/updateProfile');
const { profile } = require('console');
const bcryptjs = require('bcryptjs');

dotenv.config()

const app = express();

// Configure express-session
app.use(session({
  secret: process.env.SESSION_SECRET, // Replace with a secure secret key
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in a production environment with HTTPS
    httpOnly: true,
    // maxAge: null, // Uncomment this line to have an indefinite session
  },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// app.use((req, res, next) => {
//   console.log('Session Data:', req.session);
//   next();
// });


const db_password = process.env.PASSWORD

// Connect to MongoDB using the IPv4 loopback address or localhost
const mongoURI = `mongodb+srv://Javid_Shaik:${db_password}@cluster0.cfidmvh.mongodb.net/BookManagement`; // Specify your database name

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,
});

const db = mongoose.connection;

db.on("error", (error) => {
  console.log(`Error connecting to database ${error}`);
});
db.once('open', async  () => {
  console.log(`Connectet to Database`);
});

const collections = mongoose.connection.collections;

// Print the names of all collections
// Object.keys(collections).forEach((collectionName) => {
//   console.log('Collection Name:', collectionName);
// });

// Close the MongoDB connection
// mongoose.connection.close();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function getDefaultImageBuffer() {
  try {
    return fs.readFileSync('./static/images/default_user.jpg'); // Adjust the path to your default image
  } catch (error) {
    console.error('Error reading default image:', error);
    return null;
  }
}

const storage = multer.diskStorage({
  destination: './static/images',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }
});

app.get('/index', (req, res) => {
  const user = req.session.user;
  res.render('index', { user });
});

app.get('/register', (req, res) => {
  const errorMessage = "";
  res.render('register' , { errorMessage });
});

app.get('/login', (req, res) => {
  const errorMessage = "";
  res.render('login' , { errorMessage });
});


app.get('/user/profileImage/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user || !user.imgPath) {
      // Return a default image or an error image if the user or image is not found
      return res.sendFile(path.join(__dirname, 'static/images/default_user.jpg'));
    }

    // Serve the user's profile image
    res.sendFile(path.join(__dirname, 'static/images', user.imgPath));
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching profile image.');
  }
});





app.post('/login', authController.login);



app.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { fname, lname, username, email, password } = req.body;
    const default_img = getDefaultImageBuffer();
    const usernameExists = await User.findOne({ userName: username });
    const emailExists = await User.findOne({ email: email });

    if (usernameExists || emailExists) {
      // Set an error message
      const errorMessage = 'Username or email already exists';

      // Pass the error message to the template
      return res.render('register', { errorMessage });
    }

    let imageBuffer = default_img;
    let imagePath = 'default_user.jpg';
    if (req.file) {
      // console.log('Image file uploaded:', req.file);
      imageBuffer = req.file.buffer; // Corrected this line
      // console.log("image Buffer :" , imageBuffer);
      imagePath = req.file.filename;
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      firstName: fname,
      lastName: lname,
      userName: username,
      email: email,
      password: hashedPassword,
      profileImage: imageBuffer, // Corrected this line
      imgPath: imagePath,
    });

    await newUser.save();
    sendTokenResponse(newUser, res);

    res.redirect('/login');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

app.post('/index' , (req, res)=>{
  const user = req.session.user;
  res.render('index' , { user } );
})

app.get('/logout', (req, res) => {
  req.logout(()=>{}); // This function is provided by Passport for session-based authentication
  res.redirect('/index'); // Redirect the user to the login page or any other page you prefer
});


app.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    // console.log(username);
    const user = await User.findOne({ userName:username });
    // console.log(user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user data, including the image filename
    else {
      res.render('userProfile' , { user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving user profile' });
  }
});




app.use(router);

app.get('/user/update_profile' , (req, res)=>{
  const user = req.session.user;
  if(user)
  {
    res.render('updateUserProfile' , {user});
  }
  else res.redirect('/login');
})


app.post('/user/update_profile', upload.single('profileImage'), async (req, res) => {
  const user = req.session.user;
  try {
    const { fname, lname, email } = req.body;

    if (user) {
      let imageBuffer = user.profileImage;
      let imagePath = user.imagePath;

      if (req.file) {
        if (imagePath && imagePath !== 'default_user.jpg') {
          const pathh = path.join(__dirname, 'static/images', imagePath);
          console.log('Attempting to delete:', pathh);
        
          fs.promises.unlink(pathh)
            .then(() => {
              console.log('File deleted successfully');
            })
            .catch((err) => {
              console.error('Error deleting file:', err);
            });
        }
        imageBuffer = req.file.buffer;
        imagePath = req.file.filename;
      }

      const userId = user.user_id; // Get the user's unique identifier (e.g., _id)
      const userUpdation = await User.findByIdAndUpdate(
        userId, // Use the user's _id as the filter
        {
          firstName: fname,
          lastName: lname,
          email: email,
          profileImage: imageBuffer,
          imgPath: imagePath,
        }
      );
      userUpdation.save();

      // Update the session data with the new values
      req.session.user.firstName = fname;
      req.session.user.lastName = lname;
      req.session.user.email = email;
      req.session.user.userName = user.username;
      req.session.user.profileImage = imageBuffer;
      req.session.user.imagePath = imagePath;
      req.session.user._id = userId;

      res.render('userProfile', { user: req.session.user }); // Redirect to the user's profile
    } else {
      res.status(401).send('Unauthorized'); // Handle the case where the user is not logged in
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating profile.');
  }
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});