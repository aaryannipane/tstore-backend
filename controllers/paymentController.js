const bigPromise = require("../middlewares/bigPromise");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay')

// watch Rajorpay and Stripe payment videos

exports.sendStripeKey = bigPromise(async (req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = bigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    // optional
    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

exports.sendRazorpayKey = bigPromise(async (req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.RAZORPAY_API_KEY,
  });
});

exports.captureRazorpayPayment = bigPromise(async (req, res, next) => {
  var instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  const myOrder = await instance.orders.create({
    amount: req.body.amount, // amount should be in paise so convert it to paise
    currency: "INR",
    notes: {
      key1: "value3",
      key2: "value2",
    },
  });

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    order: myOrder
  })
});
