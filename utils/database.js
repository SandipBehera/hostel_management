const sql = require("mysql");

const connection = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mkloid@2023@#",
  database: "hostel_management",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = connection;
