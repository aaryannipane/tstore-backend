const User = require("../models/User");
const BigPromise = require("./bigPromise");
const CustomError = require("../utils/customError.js");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  // req.header is used for mobile applications
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next(new CustomError("Login first to access this page", 401));
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedToken.id);
  console.log(decodedToken);

  next();
});

exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log(req.user.role, roles)
      return next(
        new CustomError("You are not allowed to access this resource", 403)
      );
    }

    return next();
  };
};
