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
const Book = require('./models/bookSchema');
const Cart = require('./models/cartSchema');
const CartItem = require('./models/cartItemSchema');

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
  res.render('register' , { errorMessage , user:req.session.user });
});

app.get('/login', (req, res) => {
  const errorMessage = "";
  res.render('login' , { errorMessage , user:req.session.user});
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


// User functionalities

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

app.get('/profile/:username', isAuthenticated,  async (req, res) => {
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


app.post('/user/update_profile', isAuthenticated , upload.single('profileImage'), async (req, res) => {
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

// if the client is autheticated or not

async function isAuthenticated(req, res , next){
  try{
    const user = req.session.user;
    if(user){
      next();
    }
    else {
      res.redirect('/login');
    }
  } catch(error){
    console.log(error);
    res.status(500).send('Error in authentication');
  }
}

// Books views starts from here
// Admin  functionality

async function isAdmin(req, res, next) {
  try {
    const users = req.session.user;
    // Assuming you have a User model for querying the database
    const user = await User.findOne({ userName: users.username });

    if (user.isSuperUser && user.isSuperUser === true) {
      // If the user is an admin, continue to the next middleware or route handler
      next();
    } else {
      // If the user is not an admin, redirect to another page (e.g., 'not_admin_page')
      res.redirect('/not_admin_page');
    }
  } catch (err) {
    // Handle any errors that occur during the process
    res.status(500).send('Error navigating to admin page.');
  }
}
app.get('/admin/login', (req , res)=>{
  const errorMessage = "";
  res.render('./admin/adminLogin' , { errorMessage , user:req.session.user});
})


app.post('/admin/login', authController.adminLogin);

app.get('/admin', isAdmin, (req, res) => {
  // This route is only accessible to admin users
  res.render('books_curd'); // Render the 'books_curd' page for admin users
});

app.get('/not_admin_page', (req, res) => {
  res.status(403).send('Access denied. You are not an admin.'); // Optionally, provide an error message for non-admins
});

// Handle the POST request to store book details
app.post('/add-book', isAdmin , upload.single('coverImage'), async (req, res) => {
  try {
    // Extract data from the request
    const { title, author, isbn, price, publishedYear, genre, copiesAvailable, description, publisher } = req.body;

    // Get the cover image buffer from multer
    const coverImage = req.file ? req.file.filename : '';
    // Create a new instance of the Book model
    const newBook = new Book({
      title,
      author,
      isbn,
      price,
      published_year: publishedYear, // Match the field name in your schema
      genre: Array.isArray(genre) ? genre : [genre], // Ensure it's an array
      copies_available: copiesAvailable, // Match the field name in your schema
      description,
      publisher,
      cover_image: coverImage, // Match the field name in your schema
    });

    // Save the new book to the database
    await newBook.save();

    res.status(201).json({ message: 'Book saved successfully', book: newBook });
  } catch (error) {
    console.error('Error saving book:', error);
    res.status(500).json({ error: 'An error occurred while saving the book' });
  }
});

app.get('/admin/book-list', isAdmin , async (req, res) => {
  try {
    // Use the find() method to retrieve all books from the database
    const books = await Book.find();

    // Render the HTML template with the retrieved books data
    res.render('./admin/book-list', { books });
  } catch (error) {
    console.error('Error retrieving books:', error);
    res.status(500).json({ error: 'An error occurred while retrieving books' });
  }
});


app.put('/admin/books/:bookId', isAdmin , upload.single('coverImage'), async (req, res) => {
  try {
    // Get book data from the request body
    const bookId = req.params.bookId;

    const { title, author, isbn, price, published_year, genre, copies_available, description, publisher } = req.body;

    const book = Book.findById(bookId);
    const previmg = book.cover_image;
    // Check if a new cover image was uploaded
    let coverImage = req.file ? req.file.filename : previmg;

    // Find and update the book in the database
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      {
        title,
        author,
        isbn,
        price,
        published_year,
        genre: genre.split(',').map((genre) => genre.trim()), // Convert genre to an array
        copies_available,
        description,
        publisher,
        cover_image: coverImage, // Update the cover image filename
      },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'An error occurred while updating the book' });
  }
});


app.delete('/admin/books/:bookId', isAdmin, async (req, res) => {
  try {
      const bookId = req.params.bookId;

      // Find and delete the book by its ID
      const deletedBook = await Book.findByIdAndRemove(bookId);

      if (!deletedBook) {
          return res.status(404).json({ error: 'Book not found' });
      }

      // Return a successful response with status code 204 (No Content)
      res.status(204).end();
  } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ error: 'An error occurred while deleting the book' });
  }
});

app.delete('/admin/users/:userId' , isAdmin, async (req,res)=>{
  try{
    const userId = req.params.userId;

    const deletedUser = await User.findByIdAndRemove(userId);

    if(!deletedUser) {
      return res.status(404).json({ error : 'User not found'});

    }

    res.status(204).end();

  } catch(error){
    console.log('Error deleting user');
    res.status(500).json({error: 'An error occurred while deleteing the user'});
  }
});

app.get('/admin/user-list' , isAdmin,  async (req, res)=>{
  try {

    const users = await User.find({});

    res.render('./admin/users-list', { users });
  } catch(error){
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'An error occurred while retrieving users' });
  }
});


app.get('/admin/main', isAdmin , async(req, res)=>{
  res.render('./admin/adminPpage');
})


// cart functionality

app.get('/cart/view-books', isAuthenticated, async (req , res)=>{
  try {
    // Fetch all books from the database
    const books = await Book.find();
    const user = req.session.user;
    res.render('./cart/view-books', { books , user }); // Render the view-book.ejs template and pass the books data
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'An error occurred while fetching books' });
  }
});




app.get('/cart/cover-image/:bookId', async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const book = await Book.findById(bookId);

    if (!book || !book.cover_image) {
      // Return a default image or an error image if the user or image is not found
      return res.sendFile(path.join(__dirname, 'static/images/default_user.jpg'));
    }

    // Serve the user's profile image
    res.sendFile(path.join(__dirname, 'static/images', book.cover_image));
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching profile image.');
  }
});

app.post('/cart/add-to-cart' , isAuthenticated,  async (req, res)=>{
    try {
      const { userId, bookId } = req.body;

      if (!userId || !bookId) {
        return res.status(400).json({ error: 'Invalid data. userId and bookId are required.' });
      }

      const book = await Book.findById(bookId);
      const enough_copies = book.copies_available;
      if(enough_copies<=0){
        return res.json({ message: 'Sorry Not enough copies available' });
      }
      // Find or create a cart for the user
      else {
        let cart = await Cart.findOne({ userId }).populate('items');
    
        if (!cart) {
          cart = new Cart({ userId });
          await cart.save();
        }
    
        // Check if the book is already in the cart
        const existingCartItem = cart.items.find((item) =>
          item.bookId.equals(bookId)
        );
    
        if (existingCartItem) {
          // If the book is already in the cart, increase the quantity
          existingCartItem.quantity += 1;
          await existingCartItem.save();
        } else {
          // If the book is not in the cart, create a new cart item
          const newCartItem = new CartItem({ bookId });
          await newCartItem.save();
          cart.items.push(newCartItem);
        }
    
        // Save the updated cart
        await cart.save();
        res.json({ message: 'Book added to cart successfully' });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Error adding to cart' });
    }
});

app.get('/cart/view-cart', isAuthenticated,  async (req, res) => {
  try {
    // Assuming you have a user ID available in the session
    const user = req.session.user;
    const userId = user.user_id;

    // Find the user's cart and populate the 'items' array with book details
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items',
      populate: {
        path: 'bookId', // Assuming 'bookId' is the field referencing the Book model in your CartItem schema
        model: 'Book', // Replace with the actual model name for books
      },
    });

    if (!cart || !cart.items) {
      // If the cart is not found or has no items, you can handle this case accordingly
      return res.render('cart/view-cart', { cart: [] });
    }

    // At this point, 'cart.items' should be an array of populated 'CartItem' objects
    res.render('cart/view-cart', { cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'An error occurred while fetching the cart' });
  }
});

app.delete('/cart/remove-from-cart/:cartItemId', async(req, res)=>{
  try{
    const cartItemId = req.params.cartItemId;
    const removesCartItem = await CartItem.findByIdAndRemove(cartItemId);

    if(!removesCartItem){
      return res.status(404).json({ error:'Cart Item not found'});
    }
    res.status(204).end();
  } catch(error){
    console.log(error);
  }
});

// search functionality

app.get('/search-book/:searchOption/:searchText', async (req, res) => {
  const searchText = req.params.searchText;
  const searchOption = req.params.searchOption;
  
  const search_case = {
    'All': 1,
    'Title': 2,
    'Author': 3,
    'Isbn': 4,
    'Publisher': 5,
  };
  let matchingBooks = []; // Initialize an empty array to store matching books
  //  console.log(searchOption , searchText );
  // console.log(searchOption , search_case[searchOption]);
  // console.log("option-->", searchOption , search_case[searchOption]);
  switch (search_case[searchOption]) {

    case 1:
      // Search in all fields
      { matchingBooks = await Book.find({
        $or: [
          { author: { $regex: new RegExp(searchText, 'i') } },
          { isbn: { $regex: new RegExp(searchText, 'i') } },
          { title: { $regex: new RegExp(searchText, 'i') } },
          { publisher: { $regex: new RegExp(searchText, 'i') } },
        ],
      });
      break; };
    case 2:
      // Search by title
      matchingBooks = await Book.find({
        title: { $regex: new RegExp(searchText, 'i') },
      });
      break;
    case 3:
      // Search by author
      matchingBooks = await Book.find({
        author: { $regex: new RegExp(`^${searchText}$`, 'i') },
      });
      break;
    case 4:
      // Search by ISBN
      matchingBooks = await Book.find({
        isbn: { $regex: new RegExp(`^${searchText}`, 'i') },
      });
      break;
    case 5:
      // Search by publisher
      matchingBooks = await Book.find({
        publisher: { $regex: new RegExp(`^${searchText}$`, 'i') },
      });
      break;
    default:
      console.log('default value');
      break;
  }
  // console.log('Matching Books:', matchingBooks);

  res.json({ matchingBooks });
});


app.get('/search/results', (req, res) => {
  const data = req.query.data;
  // console.log(data);
  res.render('search/search-books', { data});
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});