const Express = require("express");
const router = Express.Router();

const userController = require("../controllers/user.ctrl");
const foodyController = require("../controllers/foody.ctrl");

router.post("/login", userController.login);
router.post("/food_booking", foodyController.book);
router.post("/checkcode", foodyController.checkCode);

module.exports = router;
