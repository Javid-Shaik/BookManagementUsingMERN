const mongoose = require('mongoose');

// Connect to MongoDB using the IPv4 loopback address or localhost
const mongoURI = 'mongodb+srv://Javid_Shaik:Javkid322@cluster0.cfidmvh.mongodb.net/';

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