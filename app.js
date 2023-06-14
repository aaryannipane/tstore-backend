const express = require("express");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

// for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookies and file upload middleware
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// morgan for showing requests in console
const morgan = require("morgan");
// morgan middleware
app.use(morgan("tiny"));

// import all routes
const home = require("./routes/homeRoute.js");
const user = require("./routes/userRoute.js");
const product = require("./routes/productRoute.js");
const payment = require("./routes/paymentRoute.js");
const order = require("./routes/orderRoute.js");

app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", payment);
app.use("/api/v1", order);

app.get("/signuptest", (req, res) => {
  res.render("signupTest");
});

module.exports = app;
