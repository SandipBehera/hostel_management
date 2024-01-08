const connectDatabase = require("../utils/database");

exports.queryDatabase = (sql, params, session_auth) => {
  const connection = connectDatabase(session_auth);
  console.log("quey db", session_auth);
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
