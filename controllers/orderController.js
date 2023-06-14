// const Order = require("../models/Order.js");
const Product = require("../models/Product.js");
const Order = require("../models/Order.js");

const BigPromise = require("../middlewares/bigPromise.js");
const CustomError = require("../utils/customError.js");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shppingInfo,
    orderItem,
    paymentInfo,
    taxAmount,
    shppingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shppingInfo,
    orderItem,
    paymentInfo,
    taxAmount,
    shppingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new CustomError("Please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLoggedInOrder = BigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new CustomError("Please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "delivered") {
    return next(new CustomError("Order is already marked for delivered", 401));
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItem.forEach(async (prod) => {
    await updateProductStock(prod.product, prod.quantity);
  });

  order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  // place a check for available stock and quantity
  product.stock = product.stock - quantity;

  await product.save({
    validateBeforeSave: false,
  });
}

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  await order.remove();

  res.status(200).json({
    success: true,
  });
});
