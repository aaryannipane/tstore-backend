const User = require("../models/User.js");
const BigPromise = require("../middlewares/bigPromise.js");
const CustomError = require("../utils/customError.js");
const cookieToken = require("../utils/cookieToken.js");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/emailHelper.js");
const crypto = require("crypto");

exports.signUp = BigPromise(async (req, res, next) => {
  if (!req.files) {
    return next(new CustomError("photo is required for signup", 400));
  }

  const { name, email, password } = req.body;

  if (!email || !name || !email) {
    return next(new CustomError("name, email and password is required", 400));
  }

  let file = req.files.photo;
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new CustomError("plz provide email and password", 400));
  }

  // check user in DB
  // password field was select false that's why we have to write select method
  const user = await User.findOne({ email: email }).select("+password");

  if (!user) {
    return next(new CustomError("You are not register in our database", 400));
  }

  // match the password
  const isPasswordCorrect = await user.IsValidatedPassoword(password);

  if (!isPasswordCorrect) {
    return next(
      new CustomError("email or password did not match or exist", 400)
    );
  }

  // send the token
  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout success",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new CustomError("email not found", 400));
  }

  const forgotToken = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `copy paste this link in your url and hit enter \n\n ${myUrl}`;

  try {
    await mailHelper({
      toEmail: user.email,
      subject: "password reset email lco tshirt store",
      message,
    });
    res.status(200).json({
      success: true,
      message: "email sent success",
    });
  } catch (err) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new CustomError(err.message, 500));
  }
});

exports.resetPassword = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encToken = await crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: encToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or expired", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("password and confirm password not matched", 400)
    );
  }

  user.password = req.body.password;
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;
  await user.save();

  // send json res or send token
  cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  return res.status(200).json({ success: true, user });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;

  // here we use select cause normaly it won't give us password attrib cause we set it select
  const user = await User.findById(userId).select("+password");

  const isCorrectOldPassword = await user.IsValidatedPassoword(
    req.body.oldPassword
  );

  if (!isCorrectOldPassword) {
    return next(new CustomError("old password is incorrect", 400));
  }

  // if correct set new password to user password attrib
  user.password = req.body.password;
  //  save document in database
  await user.save();

  // send cookie with token
  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files != undefined) {
    console.log("file exist", req.files);
    const user = await User.findById(req.user.id);
    const imageId = user.photo.id;
    // delete previous image
    const resp = await cloudinary.v2.uploader.destroy(imageId);

    // upload photo
    let file = req.files.photo;
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true });
});

exports.adminAllUser = BigPromise(async (req, res, next) => {
  // getting all users
  const users = await User.find();

  return res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No user found", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// put controller
exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new CustomError("No such user found", 401));
  }

  const imageId = user.photo.id;
  await cloudinary.v2.uploader.destroy(imageId);
  await user.remove();

  res.status(200).json({ success: true });
});

exports.managerAllUser = BigPromise(async (req, res, next) => {
  // getting all users with role user
  const users = await User.find({ role: "user" });

  return res.status(200).json({
    success: true,
    users,
  });
});
