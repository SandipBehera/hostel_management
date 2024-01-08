const connectDatabase = require("../utils/database");
const DateGenerator = require("../hooks/date");
const { getIO } = require("../socket/socket");
const logger = require("../logger");

exports.login = async (req, res) => {
  console.log(req.body);
  const { userid, password } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(
    `SELECT * FROM hms_users WHERE username = '${userid}' AND password = '${password}'`,
    (err, result) => {
      if (err) {
        logger.error(err);
      }
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
exports.web_login = async (req, res) => {
  const { user_id, date, userType, is_logged_in, Auth } = req.body;
  console.log(Auth);
  req.session.Auth = Auth;
  const conn = await connectDatabase(Auth);
  if (conn) {
    if (userType === "student") {
      conn.query(
        `SELECT hms_users.*, hms_user_room_assign.room_id,hms_rooms.hostel_name
      FROM hms_users
      LEFT JOIN hms_user_room_assign ON hms_users.userId = hms_user_room_assign.user_id
      LEFT JOIN hms_rooms ON hms_user_room_assign.hostel_id = hms_rooms.id where userId='${user_id}'`,
        (err, result) => {
          if (err) {
            logger.error(err);
          }
          if (result !== undefined && result?.length > 0) {
            conn.query(
              `insert into hms_logged_in_user (user_id,  date, user_type, is_logged_in) values('${user_id}','${date}','${userType}','${is_logged_in}')`,
              (err, result) => {
                if (err) {
                  logger.error(err);
                }
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
      conn.query(
        `SELECT * FROM hms_users_employee where emp_id='${user_id}'`,
        (err, result) => {
          if (err) {
            logger.error(err);
          }
          if (result !== undefined && result?.length > 0) {
            conn.query(
              `insert into hms_logged_in_user (user_id,  date, user_type, is_logged_in) values('${user_id}','${date}','${userType}','${is_logged_in}')`,
              (err, result) => {
                if (err) {
                  logger.error(err);
                }
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
  }
};
exports.users = async (req, res) => {
  const { userId, campus_name } = req.params;
  logger.info(userId);
  const date = DateGenerator();

  const Auth = req.session.Auth;
  console.log("Users Auth", Auth);
  if (Auth === undefined) {
    const master_connection_config = {
      DB_USER: process.env.DB_USER,
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_PASSWORD: process.env.DB_PASSWORD,
    };
    const connection = await connectDatabase(master_connection_config);
    connection.query(
      `SELECT * FROM  clients WHERE client_name='${campus_name}'`,
      async (err, result) => {
        if (err) {
          logger.error(err);
        }
        if (result.length > 0) {
          const connection_config = {
            DB_USER: result[0].db_user,
            DB_HOST: "13.58.144.48",
            DB_NAME: result[0].client_db,
            DB_PASSWORD: result[0].db_password,
          };
          req.session.Auth = connection_config;
          const connect = await connectDatabase(connection_config);
          connect.query(
            `SELECT
              hms_logged_in_user.*,
              COALESCE(hms_users_employee.emp_id, hms_users.userId) AS userId,
              COALESCE(hms_users_employee.emp_name, hms_users.name) AS name,
              COALESCE(hms_users_employee.emp_email, hms_users.email) AS email,
              COALESCE(hms_users_employee.branch_id, hms_users.campus_branch) AS branchId
            FROM hms_logged_in_user
            LEFT JOIN hms_users_employee ON hms_logged_in_user.user_id = hms_users_employee.emp_id
            LEFT JOIN hms_users ON hms_logged_in_user.user_id = hms_users.userId
            WHERE hms_logged_in_user.user_id = '${userId}' AND hms_logged_in_user.date ='${date}'`,
            (err, result) => {
              if (err) {
                logger.error(err);
              }
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
        }
      }
    );
  } else {
    res.send({ message: "Invalid Credentials", status: "error" });
  }
};

exports.Hostel_Onboard_Request = async (req, res) => {
  const io = getIO(); // Get the io instance from the socket.js file
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
    Auth,
  } = req.body;

  const connection = await connectDatabase(Auth);
  connection.query(
    `Insert into hms_users (
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
      if (err) {
        logger.error(err);
      }
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

exports.hostel_employee = async (req, res) => {
  const { user_id, name, email, phone, image, role } = req.body;
  console.log(req.body);
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(
    `Insert into hms_users (
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
      if (err) {
        logger.error(err);
      }
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

exports.getAllUser = async (req, res) => {
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(
    `
    SELECT hms_users.*, hms_user_room_assign.room_id,hms_rooms.hostel_name
    FROM hms_users
    LEFT JOIN hms_user_room_assign ON hms_users.userId = hms_user_room_assign.user_id
    LEFT JOIN hms_rooms ON hms_user_room_assign.hostel_id = hms_rooms.id
  `,
    (err, result) => {
      if (err) {
        logger.error(err);
      }

      if (result !== undefined && result?.length > 0) {
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

exports.logout = async (req, res) => {
  const { user_id } = req.body;
  const date = DateGenerator();
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(
    `update hms_logged_in_user set is_logged_in='0' where user_id='${user_id}' AND date ='${date}' `,
    (err, result) => {
      if (err) {
        logger.error(err);
      }
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

exports.profile_info = async (req, res) => {
  const { user_id, userType } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  if (userType === "student") {
    connection.query(
      `SELECT hms_users.* , hms_user_room_assign.room_id,hms_rooms.hostel_name
    FROM hms_users
    LEFT JOIN hms_user_room_assign ON hms_users.userId = hms_user_room_assign.user_id
    LEFT JOIN hms_rooms ON hms_user_room_assign.hostel_id = hms_rooms.id where userId='${user_id}'`,
      (err, result) => {
        if (err) {
          logger.error(err);
        }
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
      `SELECT * FROM hms_users_employee where emp_id='${user_id}'`,
      (err, result) => {
        if (err) {
          logger.error(err);
        }
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

exports.RemoveUser = async (req, res) => {
  const { user_id } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  const query = `SELECT * FROM hms_users WHERE userId = '${user_id}'`;
  const query1 = `CALL Delete_Archive_users(?)`;
  const query2 = `CALL DeleteAndArchiveUserRoomAssign(?)`;
  const query3 = `SELECT * FROM hms_user_room_assign WHERE user_id = '${user_id}'`;

  connection.query(query, [user_id], (err, userResult) => {
    if (err) {
      logger.error(err);
      return res.send({ message: "Error occurred", status: "error" });
    }

    if (userResult.length > 0) {
      connection.query(query3, [user_id], (err, roomAssignResult) => {
        if (err) {
          logger.error(err);
          return res.send({ message: "Error occurred", status: "error" });
        }

        if (roomAssignResult.length > 0) {
          connection.query(query1, [user_id], (err) => {
            if (err) {
              logger.error(err);
              return res.send({ message: "Error occurred", status: "error" });
            }

            connection.query(query2, [user_id], (err) => {
              if (err) {
                logger.error(err);
                return res.send({ message: "Error occurred", status: "error" });
              }

              res.send({
                message: "User Removed Successfully",
                status: "success",
              });
            });
          });
        } else {
          connection.query(query1, [user_id], (err) => {
            if (err) {
              logger.error(err);
              return res.send({ message: "Error occurred", status: "error" });
            }

            res.send({
              message: "User Removed Successfully",
              status: "success",
            });
          });
        }
      });
    } else {
      res.send({ message: "User not found", status: "error" });
    }
  });
};
exports.get_session = async (req, res) => {
  const Auth = req.session.Auth;
  if (Auth) {
    res.send({ message: "Session Found", status: "success", data: Auth });
  } else {
    res.send({ message: "Session Not Found", status: "error" });
  }
};
