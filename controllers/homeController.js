const BigPromise = require("../middlewares/bigPromise.js");

class HomeController {
  static home = BigPromise(async (req, res) => {
    // const result = await getResult()
    return res.status(200).json({
      success: true,
      message: "Hello from home controller",
    });
  });
}

module.exports = HomeController;
