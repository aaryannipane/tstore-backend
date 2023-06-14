const express = require("express");
const router = express.Router();

const {
  signUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUser,
  managerAllUser,
  adminGetOneUser,
  adminUpdateOneUserDetails,
  adminDeleteOneUser,
} = require("../controllers/userController.js");
const { isLoggedIn, customRole } = require("../middlewares/user.js");

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);

// admin routes
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUserDetails)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

// manager routes
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUser);

module.exports = router;
