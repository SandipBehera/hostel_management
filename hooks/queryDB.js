const connectDatabase = require("../utils/database");

exports.queryDatabase = async (sql, params, session_auth) => {
  const connection = await connectDatabase(session_auth);
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
    connection.end();
  });
};
