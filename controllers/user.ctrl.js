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
  const { user_id, date, userType, is_logged_in } = req.body;
  console.log(user_id);
  if (userType === "student") {
    connection.query(
      `SELECT users.*, user_room_assign.room_id,rooms.hostel_name
      FROM users
      LEFT JOIN user_room_assign ON users.username = user_room_assign.user_id
      LEFT JOIN rooms ON user_room_assign.hostel_id = rooms.id where username='${user_id}'`,
      (err, result) => {
        if (err) throw err;
        if (result) {
          connection.query(
            `insert into logged_in_user (user_id,  date, user_type, is_logged_in) values('${user_id}','${date}','${userType}','${is_logged_in}')`,
            (err, result) => {
              if (err) throw err;
              res.send({
                data: result[0],
                status: "success",
              });
            }
          );
        } else {
          res.send({ message: "Invalid Credentials", staus: "error" });
        }
      }
    );
  } else if (userType === "employee" || userType === "admin") {
    connection.query(
      `SELECT * FROM users_employee where emp_id='${user_id}'`,
      (err, result) => {
        if (err) throw err;
        if (result) {
          connection.query(
            `insert into logged_in_user (user_id,  date, user_type, is_logged_in) values('${user_id}','${date}','${userType}','${is_logged_in}')`,
            (err, result) => {
              if (err) throw err;
              res.send({
                data: result[0],
                status: "success",
              });
            }
          );
        } else {
          res.send({ message: "Invalid Credentials", staus: "error" });
        }
      }
    );
  }
};
exports.users = (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  const date = DateGenerator();
  console.log(date);

  connection.query(
    `SELECT 
    logged_in_user.*, 
    COALESCE(users_employee.emp_id, users.userId) AS userId,
    COALESCE(users_employee.emp_name, users.name) AS name,
    COALESCE(users_employee.emp_email, users.email) AS email,
    COALESCE(users_employee.branch_id, users.campus_branch) AS branchId
  FROM logged_in_user 
  LEFT JOIN users_employee ON logged_in_user.user_id = users_employee.emp_id
  LEFT JOIN users ON logged_in_user.user_id = users.userId
  WHERE logged_in_user.user_id = '${userId}' AND logged_in_user.date ='${date}'`,
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.send({
          data: result[0],
          message: "User List",
          status: "success",
        });
      } else {
        res.send({ message: "Invalid Credentials", status: "error" });
      }
    }
  );
};

exports.Hostel_Onboard_Request = (req, res) => {
  const io = getIO(); // Get the io instance from the socket.js file
  console.log(req.body);
  const {
    userId,
    regd_no,
    userName,
    userEmail,
    userPhone,
    semesterYear,
    branch,
    userType,
    image,
    branch_id,
  } = req.body;
  connection.query(
    `Insert into users (
    userId,
    registration_no,
    name,
    email,
    phone,
    semesterYear,
    branch,
    user_type,
    user_from,
    image,
    campus_branch
    )
    values(
      '${userId}','${regd_no}','${userName}','${userEmail}','${userPhone}','${semesterYear}','${branch}','${userType}','hostel','${image}','${branch_id}'
    )
  `,
    (err, result) => {
      if (err) throw err;
      if (result) {
        // Emit the event inside the connection handler
        io.emit("newUserOnBoard", {
          userId,
          regd_no,
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
            regd_no: regd_no,
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
    LEFT JOIN user_room_assign ON users.userId = user_room_assign.user_id
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
    LEFT JOIN user_room_assign ON users.userId = user_room_assign.user_id
    LEFT JOIN rooms ON user_room_assign.hostel_id = rooms.id where userId='${user_id}'`,
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
      `SELECT * FROM users_employee where emp_id='${user_id}'`,
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
