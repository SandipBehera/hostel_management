const sql = require("mysql2");

const master_connection_config = {
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
};

async function connectDatabase(db_config, req) {
  console.log("db user", db_config.DB_USER);
  console.log("db host", db_config.DB_HOST);
  console.log("db password", db_config.DB_PASSWORD);
  console.log("db name", db_config.DB_NAME);
  const dyno_db = {
    user: db_config.DB_USER,
    host: db_config.DB_HOST,
    database: db_config.DB_NAME,
    password: db_config.DB_PASSWORD,
  };
  console.log("dyno db", dyno_db);
  try {
    const connection = await sql.createConnection(
      dyno_db || master_connection_config
    );
    // Keep-alive query
    // setInterval(async function () {
    //   try {
    //     const [results] = await connection.execute("SELECT 1");
    //     console.log("Keep-alive query executed successfully:", results);
    //   } catch (queryErr) {
    //     console.error("Error executing keep-alive query:", queryErr);
    //   }
    // }, 1000 * 60 * 5); // 5 minutes

    // Handle disconnection error
    connection.on("error", (err) => {
      console.error("Database connection error:", err);
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.error("Database connection was closed. Reconnecting...");
        connectDatabase(master_connection_config); // Try to reconnect
      } else {
        throw err;
      }
    });

    // Handle connection close event
    connection.on("end", () => {
      console.log("Database connection was closed. Reconnecting...");
      connectDatabase(master_connection_config); // Try to reconnect
    });

    return connection;
  } catch (err) {
    console.error("Error connecting to database:", err.stack);
    setTimeout(() => connectDatabase(master_connection_config), 2000); // Try to reconnect every 2 seconds
  }
}

module.exports = connectDatabase;
