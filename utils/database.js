const sql = require("mysql2");

const connection = sql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});
try {
  connection.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
  });
} finally {
  connection.end();
}

module.exports = connection;
