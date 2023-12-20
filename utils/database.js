const sql = require("mysql2");

const connection = sql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});
connection.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});
// Handle disconnection error
connection.on("error", (err) => {
  console.error("Database connection error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Database connection was closed. Reconnecting...");
    // You can attempt to reconnect here if needed
  } else {
    throw err;
  }
});
module.exports = connection;
