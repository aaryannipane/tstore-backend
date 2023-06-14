const express = require("express");
const router = express.Router();

const {getAllProducts, addProduct, adminGetAllProduct, getOneProduct, adminUpdateOneProduct, adminDeleteOneProduct, addReview, deleteReview, getReviewsOneProduct} = require("../controllers/productController")
const { isLoggedIn, customRole } = require("../middlewares/user.js");

// user routes
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getOneProduct);
router.route("/review").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/reviews").get(isLoggedIn, getReviewsOneProduct);

// admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);

router.route("/admin/products").get(isLoggedIn, customRole("admin"), adminGetAllProduct)

router.route("/admin/product/:id")
.put(isLoggedIn, customRole("admin"), adminUpdateOneProduct)
.delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct)

module.exports = router;
