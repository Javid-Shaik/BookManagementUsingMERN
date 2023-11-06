const mongoose = require('mongoose');

// Connect to MongoDB using the IPv4 loopback address or localhost
const dotenv = require('dotenv');
const db_password = process.env.PASSWORD
dotenv.config()
const mongoURI = `mongodb+srv://Javid_Shaik:${db_password}@cluster0.cfidmvh.mongodb.net/BookManagement`;;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000,
  })

const db = mongoose.connection;
db.on("error", (error)=>{
  console.log(`Error connecting to database ${error}`);
});
db.once('open', ()=>{
  console.log(`Connected to Database`);
})