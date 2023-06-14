const { sendStripeKey, sendRazorpayKey, captureStripePayment, captureRazorpayPayment } = require("../controllers/paymentController.js");
const { isLoggedIn, customRole } = require("../middlewares/user.js");
const router = require("express").Router();

router.route("/stripekey").get(isLoggedIn, sendStripeKey)
router.route("/razorpaykey").get(isLoggedIn, sendRazorpayKey)


router.route("/capturestripe").post(isLoggedIn, captureStripePayment)
router.route("/capturerazorpay").post(isLoggedIn, captureRazorpayPayment)



module.exports = router