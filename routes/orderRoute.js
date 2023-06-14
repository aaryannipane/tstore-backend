const {
  createOrder,
  getOneOrder,
  getLoggedInOrder,
  adminGetAllOrders,
  adminUpdateOrder,
  adminDeleteOrder,
} = require("../controllers/orderController.js");
const { isLoggedIn, customRole } = require("../middlewares/user.js");
const router = require("express").Router();

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
router.route("/myorder").get(isLoggedIn, getLoggedInOrder);


router.route("/admin/orders").get(isLoggedIn, customRole("admin"), adminGetAllOrders);
router.route("/admin/order/:id").put(isLoggedIn, customRole("admin"), adminUpdateOrder);
router.route("/admin/order/:id").delete(isLoggedIn, customRole("admin"), adminDeleteOrder);

module.exports = router;
