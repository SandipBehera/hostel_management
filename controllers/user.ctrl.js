const connection = require("../utils/database");

exports.login = (req, res) => {
  console.log(req.body);
  const { userid, password } = req.body;

  connection.query(
    `SELECT * FROM users WHERE username = '${userid}' AND password = '${password}'`,
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.send({
          data: {
            name: result[0].name,
            email: result[0].email,
            phone: result[0].phone,
            user_type: result[0].user_type,
            user_name: result[0].username,
          },
          message: "Login Successfull",
          status: "success",
        });
      } else {
        res.send({ message: "Invalid Credentials", staus: "error" });
      }
    }
  );
};
