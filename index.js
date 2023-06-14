require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
const cloudinary = require("cloudinary");

// connect with db
connectDB();

// cloudinary config goes here
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// set template files location
app.set("views", "./views");

// for using ejs
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
