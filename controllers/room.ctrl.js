const connectDatabase = require("../utils/database");
const logger = require("../logger");
const { queryDatabase } = require("../hooks/queryDB");
const { sendEmail } = require("../mail/sendEmail");
const { RoomAssigend } = require("../mail/template/new_room");
exports.create_rooms = async (req, res) => {
  const { hostel_name, floor_count, room_count, rooms, branch_id } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  logger.error(rooms);
  const query = `INSERT INTO hms_rooms (hostel_name, floor_count, room_count, room_details, branch_id) VALUES ('${hostel_name}', '${floor_count}', '${room_count}', '${rooms}', '${branch_id}')`;
  connection.query(query, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error creating rooms", status: "error" });
    } else {
      res.send({ message: "Rooms created successfully", status: "success" });
    }
  });
};

exports.getRooms = async (req, res) => {
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(`SELECT * FROM hms_rooms `, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error fetching rooms", status: "error" });
    } else {
      res.send({
        message: "Rooms fetched successfully",
        status: "success",
        data: result,
      });
    }
  });
};
exports.get_student_room = async (req, res) => {
  try {
    const { branch_id } = req.params;
    const Auth = req.session.Auth;
    const connection = await connectDatabase(Auth);
    // Fetch hms_rooms
    const rooms = await queryDatabase(
      `SELECT * FROM hms_rooms WHERE branch_id = ?`,
      [branch_id]
    );

    // Extract unique room numbers
    const roomDetails = [
      ...new Set(
        rooms.flatMap((room) =>
          room.room_details.map((detail) => detail.details.room_no)
        )
      ),
    ];

    // Fetch user details for all unique room numbers in a single query
    const usersDetails = await queryDatabase(
      `SELECT hms_user_room_assign.*, hms_users.name, hms_users.branch, hms_users.semesterYear 
       FROM hms_user_room_assign
       INNER JOIN hms_users ON hms_users.userId = hms_user_room_assign.user_id
       WHERE room_id IN (${roomDetails.map(() => "?").join(",")})
       AND branch_id = ?`,
      [...roomDetails, branch_id]
    );
    // Assign user details to respective hms_rooms
    rooms.forEach((room) => {
      room.users_details = usersDetails.filter(
        (user) =>
          parseInt(user.hostel_id) === room.id &&
          room.room_details.some(
            (detail) => detail.details.room_no === user.room_id
          )
      );
    });

    res.send({
      message: "Rooms fetched successfully",
      status: "success",
      data: rooms,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      message: "Error fetching rooms",
      status: "error",
    });
  }
};
exports.Assign_rooms = async (req, res) => {
  const { user_id, hostel_id, floor_id, room_id, branch_id } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  const query = `INSERT INTO hms_user_room_assign (user_id, hostel_id, floor_id, room_id, branch_id)
  VALUES ('${user_id}', '${hostel_id}', '${floor_id}', '${room_id}', '${branch_id}')
  ON DUPLICATE KEY UPDATE
  hostel_id = VALUES(hostel_id),
  floor_id = VALUES(floor_id),
  room_id = VALUES(room_id),
  branch_id = VALUES(branch_id)`;
  const query2 = `INSERT INTO hms_user_room_assign_history (user_id, hostel_id, floor_id, room_id, branch_id)
  VALUES ('${user_id}', '${hostel_id}', '${floor_id}', '${room_id}', '${branch_id}')`;
  connection.query(query, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error Assigning rooms", status: "error" });
    } else {
      connection.query(query2, (err, result) => {
        if (err) {
          logger.error(err);
          res.send({ message: "Error Assigning rooms", status: "error" });
        } else {
          RoomAssigend(user_id, hostel_id, room_id, (err, content) => {
            if (err) {
              console.error("Error generating email content:", err);
            } else {
              sendEmail(
                content,
                "sandip.sudip36@gmail.com",
                "Welcome to Hostel Management System- Room Assigned"
              );
            }
          });
          res.send({
            message: "Rooms Assigned successfully",
            status: "success",
          });
        }
      });
    }
  });
};

exports.Get_Student_By_Room = async (req, res) => {
  const { hostel_id, floor_id, room_id } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  // const query = `SELECT hms_users.* FROM hms_users
  // INNER JOIN hms_user_room_assign ON hms_users.userId = hms_user_room_assign.user_id
  //  WHERE hms_user_room_assign.hostel_id = '${hostel_id}' AND hms_user_room_assign.floor_id = '${floor_id}' AND hms_user_room_assign.room_id = '${room_id}'`;
  const query = `
  SELECT
  u.id,
  u.userId,
  u.name,
  u.image,
  COALESCE(MAX(CASE WHEN DATE(sa.created_at) = CURDATE() THEN 'taken' ELSE 'not taken' END), 'not taken') AS attendance_taken,
  GROUP_CONCAT(sa.comments) AS comments,
  GROUP_CONCAT(sa.status) AS statuses
FROM
  hms_users u
  INNER JOIN hms_user_room_assign ura ON u.userId = ura.user_id
  LEFT JOIN hms_student_attandance sa ON u.userId = sa.user_id AND ura.user_id = sa.user_id AND DATE(sa.created_at) = CURDATE()
WHERE
  ura.hostel_id = '${hostel_id}'
  AND ura.floor_id = '${floor_id}'
  AND ura.room_id = '${room_id}'
GROUP BY
  u.id, u.userId, u.name, u.image;
    `;
  connection.query(query, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error fetching rooms", status: "error" });
    } else {
      res.send({
        message: "Rooms fetched successfully",
        status: "success",
        data: result,
      });
    }
  });
};

exports.Take_Attendance = async (req, res) => {
  const { user_id, hostel_id, room_id, status, comments, branch_id } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  // Check if a record exists for the userId and today's date
  const checkQuery = `
    SELECT * 
    FROM hms_student_attandance 
    WHERE user_id = '${user_id}' 
    AND DATE(created_at) = CURDATE()
    LIMIT 1
  `;

  connection.query(checkQuery, (checkErr, checkResult) => {
    if (checkErr) {
      logger.error(checkErr);
      res.send({ message: "Error Checking Attendance", status: "error" });
      return;
    }

    if (checkResult && checkResult.length > 0) {
      // If a record exists, update the status to "absent"
      const updateQuery = `
        UPDATE hms_student_attandance 
        SET status = '0', comments = '${comments !== null ? comments : ""}'
        WHERE id = '${checkResult[0].id}'
      `;

      connection.query(updateQuery, (updateErr, updateResult) => {
        if (updateErr) {
          logger.error(updateErr);
          res.send({ message: "Error Updating Attendance", status: "error" });
        } else {
          res.send({
            message: "Attendance Updated Successfully",
            status: "success",
          });
        }
      });
    } else {
      // If no record exists, insert a new record
      const insertQuery = `
        INSERT INTO hms_student_attandance (user_id, hostel_name, room_number, status, comments, branch_id) 
        VALUES ('${user_id}', '${hostel_id}', '${room_id}', '${status}', '${
        comments !== null ? comments : ""
      }', '${branch_id}')
      `;

      connection.query(insertQuery, (insertErr, insertResult) => {
        if (insertErr) {
          logger.error(insertErr);
          res.send({ message: "Error Taking Attendance", status: "error" });
        } else {
          res.send({
            message: "Attendance Taken Successfully",
            status: "success",
          });
        }
      });
    }
  });
};

exports.Today_Attendance = async (req, res) => {
  const { hostel_id } = req.body;
  // const query = `SELECT hms_users.* FROM hms_users INNER JOIN hms_student_attandance ON hms_users.username = hms_student_attandance.user_id INNER JOIN hms_rooms ON hms_rooms.id = hms_student_attandance.hostel_name WHERE hms_student_attandance.hostel_name = '${hostel_id}' AND DATE(hms_student_attandance.created_at) = CURDATE()`;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  const query = `SELECT
  hms_users.*,
  hms_student_attandance.*,
  hms_rooms.hostel_name,
  hms_user_room_assign.room_id

FROM
  hms_users
INNER JOIN
  hms_student_attandance ON hms_users.userId = hms_student_attandance.user_id
INNER JOIN
  hms_rooms ON hms_rooms.id = hms_student_attandance.hostel_name
INNER JOIN
  hms_user_room_assign ON hms_user_room_assign.user_id = hms_student_attandance.user_id
WHERE
  hms_student_attandance.hostel_name = '${hostel_id}'
  AND DATE(hms_student_attandance.created_at) = CURDATE();`;
  connection.query(query, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error fetching rooms", status: "error" });
    } else {
      res.send({
        message: "Attandence fetched successfully",
        status: "success",
        data: result,
      });
    }
  });
};
exports.updateAttandance = async (req, res) => {
  const { id, status, comments } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  logger.error(req.body);
  const query = `UPDATE hms_student_attandance SET status = '${status}', comments = '${comments}' WHERE id = '${id}' AND DATE(created_at) = CURDATE()`;
  connection.query(query, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error Updating Attendance", status: "error" });
    } else {
      res.send({
        message: "Attendance Updated successfully",
        status: "success",
      });
    }
  });
};

exports.delete_room = async (req, res) => {
  const { id } = req.params;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  const query = `DELETE FROM hms_rooms WHERE id = '${id}'`;
  connection.query(query, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error Deleting Room", status: "error" });
    } else {
      res.send({ message: "Room Deleted successfully", status: "success" });
    }
  });
};

exports.update_room = async (req, res) => {
  const { id } = req.params;
  const { hostel_name, floor_count, room_count, rooms, branch_id } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  const query = `UPDATE hms_rooms SET hostel_name = '${hostel_name}', floor_count = '${floor_count}', room_count = '${room_count}', room_details = '${rooms}', branch_id = '${branch_id}' WHERE id = '${id}'`;
  connection.query(query, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error Updating Room", status: "error" });
    } else {
      res.send({ message: "Room Updated successfully", status: "success" });
    }
  });
};
