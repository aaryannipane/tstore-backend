const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Provide a name"],
    maxLength: [40, "Name should be under 40 character"],
  },
  email: {
    type: String,
    required: [true, "Please Provide a email"],
    validate: [validator.isEmail, "Please enter email in correct format"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please Provide a password"],
    minlength: [6, "password should be atleast 6 char"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: { type: String, required: true },
    secure_url: { type: String, required: true },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// encrypt password before save -- HOOKS
// we can't use arrow function in this step
userSchema.pre("save", async function (next) {
  // if password is not modified then don't encrypt
  if (!this.isModified("password")) return next(); 

  this.password = await bcrypt.hash(this.password, 10);
});

// validate the password with passed on user password  (CUSTOM METHODS IN SCHEMA to validate password)
userSchema.methods.IsValidatedPassoword = async function (userSendPassword) {
  return await bcrypt.compare(userSendPassword, this.password);
};

// create and return jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// create token for forgot password (just a random string)
userSchema.methods.getForgotPasswordToken = function () {
  // generate long and random string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  // make sure to get hash on backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  // time span of token
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
