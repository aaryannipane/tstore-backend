const Product = require("../models/Product.js");
const BigPromise = require("../middlewares/bigPromise.js");
const CustomError = require("../utils/customError.js");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause.js");

// WATCH: again watch (working on products) get logic

exports.addProduct = BigPromise(async (req, res, next) => {
  // images
  let imageArray = [];
  if (!req.files) {
    return next(new CustomError("images are required", 401));
  }

  if (req.files) {
    // use name "photos" for image property in front-end too
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;

  let product = await Product.create(req.body);

  return res.status(200).json({
    success: true,
    product,
  });
});

// TODO: understand this controller use of WhereClause class and each part of it [watch 114 video for correcting some error in code]
exports.getAllProducts = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalProductCount = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base.clone();

  const filteredProductCount = products.length;

  productsObj.pager(resultPerPage);
  products = await productsObj.base;

  res.status(200).json({
    success: true,
    products,
    filteredProductCount,
    totalProductCount,
  });
});

// get single product
exports.getOneProduct = BigPromise(async (req, res, next) => {
  // id from url
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found with this id", 401));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment: comment,
  };

  const product = await Product.findById(productId);

  const AlreadyReview = product.reviews.find((rev) => {
    rev.user.toString() === req.user._id.toString();
  });

  if (AlreadyReview) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numerOfReviews = product.reviews.length;
  }

  // adjust ratings
  product.ratings =
    product.reviews.reduce((acc, item) => {
      item.rating + acc;
    }, 0) / product.reviews.length;

  // save
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  // returns value that are not matched
  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  const numberOfReviews = reviews.length;

  // adjust ratings
  product.ratings =
    product.reviews.reduce((acc, item) => {
      item.rating + acc;
    }, 0) / product.reviews.length;

  // update the product
  Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getReviewsOneProduct = BigPromise(async (req, res, next)=>{
  const product = await Product.findById(req.query.id)

  res.status(200).json({
    success: true,
    reviews: product.reviews 
  })
})

// ADMIN CONTROLLER

// admin get all products
exports.adminGetAllProduct = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

// admin update one product with photos
exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new CustomError("No product found with this id", 401));
  }

  let imageArray;

  if (req.files) {
    // destroy existing images
    for (let i = 0; i < product.photos.length; i++) {
      const result = await cloudinary.v2.uploader.destroy(product.photos[i].id);
    }

    // upload and save new images
    // use name "photos" for image property in front end too
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;

  // new option is to return updated product not old product
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// admin delete on product
exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new CustomError("No product found with this id", 401));
  }

  // destroy the images of product from cloudinary
  for (let i = 0; i < product.photos.length; i++) {
    const result = await cloudinary.v2.uploader.destroy(product.photos[i].id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "product was deleted!",
  });
});
