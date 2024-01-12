const sql = require("mysql2");

const master_connection_config = {
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
};

async function connectDatabase(db_config) {
  const dyno_db = {
    user: db_config.DB_USER,
    host: db_config.DB_HOST,
    database: db_config.DB_NAME,
    password: db_config.DB_PASSWORD,
  };
  // console.log("db_config", dyno_db);
  try {
    const connection = await sql.createConnection(dyno_db);

    // Handle disconnection error
    connection.on("error", (err) => {
      console.error("Database connection error:", err);
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.error("Database connection was closed. Reconnecting...");
        setTimeout(() => {
          connection.connect((connectErr) => {
            if (connectErr) {
              console.error("Reconnection attempt failed:", connectErr);
              return;
            }
            console.log("Successfully reconnected to the database.");
          });
        }, 2000);
      } else {
        throw err;
      }
    });

    // Handle connection close event
    // connection.on("end", () => {
    //   console.log("Database connection was closed. Reconnecting...");
    //   setTimeout(() => {
    //     connection.connect((connectErr) => {
    //       if (connectErr) {
    //         console.error("Reconnection attempt failed:", connectErr);
    //         return;
    //       }
    //       console.log("Successfully reconnected to the database.");
    //     });
    //   }, 2000);
    // });

    return connection;
  } catch (err) {
    console.error("Error connecting to database:", err.stack);
    throw err; // Propagate the error for higher-level handling
  }
}

module.exports = connectDatabase;
