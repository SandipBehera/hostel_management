const Express = require("express");
const BodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const userController = require("./controllers/user.ctrl");
const foodyController = require("./controllers/foody.ctrl");

const app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: "*" }));

app.post("/login", userController.login);
app.post("/food_booking", foodyController.book);

process.env.NODE_ENV === "production"
  ? (PORT = process.env.PROD_PORT)
  : (PORT = process.env.DEV_PORT);

app.listen(PORT, () => {
  console.log(`App running on ${process.env.NODE_ENV} port ${PORT}.`);
});
