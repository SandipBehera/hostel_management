const Express = require("express");
const BodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = Express();
const MasterRouter = require("./utils/routes"); // <== import the router from routes.js
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: "*" }));

app.use("/api", MasterRouter); // <== use the router here

process.env.NODE_ENV === "production"
  ? (PORT = process.env.PROD_PORT)
  : (PORT = process.env.DEV_PORT);

app.listen(PORT, () => {
  console.log(`App running on ${process.env.NODE_ENV} port ${PORT}.`);
});
