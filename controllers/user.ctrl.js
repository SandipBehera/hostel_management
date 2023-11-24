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
exports.web_login = (req, res) => {
  console.log(req.body);
  const { user_id, name, date, userType, is_logged_in } = req.body;

  connection.query(
    `Insert into logged_in_user (user_id,
    name,
    date,
    user_type,
    is_logged_in) values ('${user_id}','${name}','${date}','${userType}','${is_logged_in}')`,
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.send({
          data: {
            user_id: user_id,
            name: name,
            is_logged_in: is_logged_in,
            uset_type: userType,
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
exports.users = (req, res) => {
  const { userId } = req.params;
  const date = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  connection.query(
    `SELECT * FROM logged_in_user where user_id='${userId}' AND date ='${date}' `,
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.send({
          data: result[0],
          message: "User List",
          status: "success",
        });
      } else {
        res.send({ message: "Invalid Credentials", staus: "error" });
      }
    }
  );
};

exports.Hostel_Onboard_Request = (req, res) => {
  console.log(req.body);
  const {
    userId,
    userName,
    userEmail,
    userPhone,
    semesterYear,
    branch,
    userType,
    image,
  } = req.body;
  const password = "temp1234";
  connection.query(
    `Insert into users (
    username,
    name,
    email,
    phone,
    semesterYear,
    branch,
    password,
    user_type,
    user_from,
    image )
    values(
      '${userId}','${userName}','${userEmail}','${userPhone}','${semesterYear}','${branch}','${password}','${userType}','hostel','${image}'


    )
  `,
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.send({
          data: {
            user_id: userId,
            name: userName,
            email: userEmail,
            phone: userPhone,
            user_type: userType,
            user_name: userId,
          },
          message: "User Added Successfull",
          status: "success",
        });
      } else {
        res.send({ message: "Something Wrong Happened", staus: "error" });
      }
    }
  );
};

exports.getAllUser = (req, res) => {
  connection.query(
    `
    SELECT users.*, user_room_assign.room_id,rooms.hostel_name
    FROM users
    LEFT JOIN user_room_assign ON users.username = user_room_assign.user_id
    LEFT JOIN rooms ON user_room_assign.hostel_id = rooms.id
  `,
    (err, result) => {
      if (err) throw err;

      if (result.length > 0) {
        res.send({
          data: result,
          message: "User List",
          status: "success",
        });
      } else {
        res.send({ message: "Invalid Credentials", status: "error" });
      }
    }
  );
};

exports.logout = (req, res) => {
  const { user_id } = req.body;
  const date = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  connection.query(
    `update logged_in_user set is_logged_in='0' where user_id='${user_id}' AND date ='${date}' `,
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.send({
          data: result[0],
          message: "User List",
          status: "success",
        });
      } else {
        res.send({ message: "Invalid Credentials", staus: "error" });
      }
    }
  );
};
