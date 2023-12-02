const Express = require("express");
const BodyParser = require("body-parser");
const cors = require("cors");
const Http = require("http");
const { initializeSocket } = require("./socket/socket");
const fileUpload = require("express-fileupload");

require("dotenv").config();

const app = Express();
const server = Http.createServer(app);
initializeSocket(server);

const MasterRouter = require("./utils/routes");
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors({ origin: "*" }));

app.use("/api", MasterRouter);

process.env.NODE_ENV === "production"
  ? (PORT = process.env.PROD_PORT)
  : (PORT = process.env.DEV_PORT);

server.listen(PORT, () => {
  console.log(`App running on ${process.env.NODE_ENV} port ${PORT}.`);
});
