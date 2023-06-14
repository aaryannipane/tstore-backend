const HomeController = require("../controllers/homeController");

const router = require("express").Router();

router.get("/", HomeController.home);

module.exports = router;
