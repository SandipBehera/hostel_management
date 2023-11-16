const sql = require("mysql");

const connection = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hostel_management",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = connection;
