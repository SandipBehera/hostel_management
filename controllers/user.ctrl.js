const connection = require("../utils/database");
const DateGenerator = require("../hooks/date");
const { getIO } = require("../socket/socket");

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
  const query = `
  INSERT INTO logged_in_user (user_id, name, date, user_type, is_logged_in)
  VALUES (?, ?, ?, ?, ?)`;
  connection.query(
    query,
    [user_id, name, date, userType, is_logged_in, user_id],
    (err, result) => {
      if (err) throw err;
      connection.query(
        "SELECT username, name, user_type, roles FROM users WHERE username = ?",
        [user_id],
        (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            if (result[0].roles === null) {
              result[0].roles = { data: { role: "" } };
            }

            res.send({
              data: {
                roles: result[0].roles.data.role,
                user_id: user_id,
                name: name,
                is_logged_in: is_logged_in,
                user_type: userType,
              },
              message: "Login Successfull",
              status: "success",
            });
          } else {
            res.send({ message: "Invalid Credentials", staus: "error" });
          }
        }
      );
    }
  );
};
exports.users = (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  const date = DateGenerator();
  console.log(date);
  connection.query(
    `SELECT logged_in_user.*, users.* FROM logged_in_user 
    INNER JOIN users ON logged_in_user.user_id = users.username
    where user_id='${userId}' AND date ='${date}' `,
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
  const io = getIO(); // Get the io instance from the socket.js file
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
    role,
    branch_id,
  } = req.body;
  connection.query(
    `Insert into users (
    username,
    name,
    email,
    phone,
    semesterYear,
    branch,
    user_type,
    user_from,
    image,
    roles,
    campus_branch
    )
    values(
      '${userId}','${userName}','${userEmail}','${userPhone}','${semesterYear}','${branch}','${userType}','hostel','${image}','${role}','${branch_id}'
    )
  `,
    (err, result) => {
      if (err) throw err;
      if (result) {
        // Emit the event inside the connection handler
        io.emit("newUserOnBoard", {
          userId,
          userName,
          userEmail,
          userPhone,
          semesterYear,
          branch,
          userType,
          image,
          role,
          branch_id,
        });
        res.send({
          data: {
            user_id: userId,
            name: userName,
            email: userEmail,
            phone: userPhone,
            user_type: userType,
            user_name: userId,
            role: role,
            branchid: branch_id,
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

exports.hostel_employee = (req, res) => {
  const { user_id, name, email, phone, image, role } = req.body;
  console.log(req.body);
  connection.query(
    `Insert into users (
    username,
    name,
    email,
    phone,
    user_type,
    user_from,
    image,
    roles )
    values(
      '${user_id}','${name}','${email}','${phone}',"empolyee","hostel",'${image}','${role}'
    )
  `,
    (err, result) => {
      if (err) throw err;
      if (result) {
        const users_data = users();
        res.send({
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
  const date = DateGenerator();
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

exports.profile_info = (req, res) => {
  const { user_id, userType } = req.body;
  console.log(user_id);
  if (userType === "student") {
    connection.query(
      `SELECT users.* , user_room_assign.room_id,rooms.hostel_name
    FROM users
    LEFT JOIN user_room_assign ON users.username = user_room_assign.user_id
    LEFT JOIN rooms ON user_room_assign.hostel_id = rooms.id where username='${user_id}'`,
      (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          res.send({
            data: result[0],
            status: "success",
          });
        } else {
          res.send({ message: "Invalid Credentials", staus: "error" });
        }
      }
    );
  } else {
    connection.query(
      `SELECT * FROM users_employee where employee_id='${user_id}'`,
      (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          res.send({
            data: result[0],
            status: "success",
          });
        } else {
          res.send({ message: "Invalid Credentials", staus: "error" });
        }
      }
    );
  }
};
