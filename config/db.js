const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DB connected"))
    .catch((err) => {
      console.log("DB connection issue");
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectDB;
