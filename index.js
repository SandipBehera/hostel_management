const Express = require("express");
const BodyParser = require("body-parser");
const cors = require("cors");
const Http = require("http");
const { initializeSocket } = require("./socket/socket");
const fileUpload = require("express-fileupload");
const logger = require("./logger");
require("dotenv").config();

const app = Express();
const server = Http.createServer(app);
initializeSocket(server);

const MasterRouter = require("./utils/routes");
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors({ origin: "*" }));
app.use("/upload", Express.static("upload"));

app.use("/api", MasterRouter);
// Error handling middleware
app.use((err, req, res, next) => {
  // Log the error
  console.error(err);
  logger.error(err);

  // Send an appropriate response to the client
  res.status(500).send("Something went wrong!");
});
// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  logger.error(err);

  // Optionally, you might want to gracefully close your server or perform cleanup here
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  logger.error(reason);
});
process.env.NODE_ENV === "production"
  ? (PORT = process.env.PROD_PORT)
  : (PORT = process.env.DEV_PORT);

server.listen(PORT, () => {
  console.log(`App running on ${process.env.NODE_ENV} port ${PORT}.`);
});
