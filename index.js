const Express = require("express");
const BodyParser = require("body-parser");
const cors = require("cors");
const userController = require("./controllers/user.ctrl");
const foodyController = require("./controllers/foody.ctrl");

const app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: "*" }));

app.post("/login", userController.login);
app.post("/food_booking", foodyController.book);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
