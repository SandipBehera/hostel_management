const sql = require("mysql2");

const connectionConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
};

function connectDatabase() {
  const connection = sql.createConnection(connectionConfig);

  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to database:", err.stack);
      setTimeout(connectDatabase, 2000); // Try to reconnect every 2 seconds
    } else {
      console.log("Connected to the database");
    }
  });
  setInterval(function () {
    connection.query("SELECT 1", (queryErr, results) => {
      if (queryErr) {
        console.error("Error executing keep-alive query:", queryErr);
      } else {
        console.log("Keep-alive query executed successfully:", results);
      }
    });
  }, 1000 * 60 * 5); // 5 minutes
  // Handle disconnection error
  connection.on("error", (err) => {
    console.error("Database connection error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed. Reconnecting...");
      connectDatabase(); // Try to reconnect
    } else {
      throw err;
    }
  });

  // Handle connection close event
  connection.on("end", () => {
    console.log("Database connection was closed. Reconnecting...");
    connectDatabase(); // Try to reconnect
  });

  return connection;
}

const connection = connectDatabase();
module.exports = connection;
