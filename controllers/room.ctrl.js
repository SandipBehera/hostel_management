const connection = require("../utils/database");
const logger = require("../logger");
const { queryDatabase } = require("../hooks/queryDB");
const { sendEmail } = require("../mail/sendEmail");
const { RoomAssigend } = require("../mail/template/new_room");
exports.create_rooms = (req, res) => {
  const { hostel_name, floor_count, room_count, rooms, branch_id } = req.body;

  logger.error(rooms);
  const query = `INSERT INTO rooms (hostel_name, floor_count, room_count, room_details, branch_id) VALUES ('${hostel_name}', '${floor_count}', '${room_count}', '${rooms}', '${branch_id}')`;
  connection.query(query, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error creating rooms", status: "error" });
    } else {
      res.send({ message: "Rooms created successfully", status: "success" });
    }
  });
};

exports.getRooms = (req, res) => {
  connection.query(`SELECT * FROM rooms `, (err, result) => {
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

    // Fetch rooms
    const rooms = await queryDatabase(
      `SELECT * FROM rooms WHERE branch_id = ?`,
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
      `SELECT user_room_assign.*, users.name, users.branch, users.semesterYear 
       FROM user_room_assign
       INNER JOIN users ON users.userId = user_room_assign.user_id
       WHERE room_id IN (${roomDetails.map(() => "?").join(",")})
       AND branch_id = ?`,
      [...roomDetails, branch_id]
    );
    // Assign user details to respective rooms
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
exports.Assign_rooms = (req, res) => {
  const { user_id, hostel_id, floor_id, room_id, branch_id } = req.body;
  const query = `INSERT INTO user_room_assign (user_id, hostel_id, floor_id, room_id, branch_id)
  VALUES ('${user_id}', '${hostel_id}', '${floor_id}', '${room_id}', '${branch_id}')
  ON DUPLICATE KEY UPDATE
  hostel_id = VALUES(hostel_id),
  floor_id = VALUES(floor_id),
  room_id = VALUES(room_id),
  branch_id = VALUES(branch_id)`;
  const query2 = `INSERT INTO user_room_assign_history (user_id, hostel_id, floor_id, room_id, branch_id)
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

exports.Get_Student_By_Room = (req, res) => {
  const { hostel_id, floor_id, room_id } = req.body;
  // const query = `SELECT users.* FROM users
  // INNER JOIN user_room_assign ON users.userId = user_room_assign.user_id
  //  WHERE user_room_assign.hostel_id = '${hostel_id}' AND user_room_assign.floor_id = '${floor_id}' AND user_room_assign.room_id = '${room_id}'`;
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
  users u
  INNER JOIN user_room_assign ura ON u.userId = ura.user_id
  LEFT JOIN student_attandance sa ON u.userId = sa.user_id AND ura.user_id = sa.user_id AND DATE(sa.created_at) = CURDATE()
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

exports.Take_Attendance = (req, res) => {
  const { user_id, hostel_id, room_id, status, comments, branch_id } = req.body;

  // Check if a record exists for the userId and today's date
  const checkQuery = `
    SELECT * 
    FROM student_attandance 
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
        UPDATE student_attandance 
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
        INSERT INTO student_attandance (user_id, hostel_name, room_number, status, comments, branch_id) 
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

exports.Today_Attendance = (req, res) => {
  const { hostel_id } = req.body;
  // const query = `SELECT users.* FROM users INNER JOIN student_attandance ON users.username = student_attandance.user_id INNER JOIN rooms ON rooms.id = student_attandance.hostel_name WHERE student_attandance.hostel_name = '${hostel_id}' AND DATE(student_attandance.created_at) = CURDATE()`;
  const query = `SELECT
  users.*,
  student_attandance.*,
  rooms.hostel_name,
  user_room_assign.room_id

FROM
  users
INNER JOIN
  student_attandance ON users.userId = student_attandance.user_id
INNER JOIN
  rooms ON rooms.id = student_attandance.hostel_name
INNER JOIN
  user_room_assign ON user_room_assign.user_id = student_attandance.user_id
WHERE
  student_attandance.hostel_name = '${hostel_id}'
  AND DATE(student_attandance.created_at) = CURDATE();`;
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
exports.updateAttandance = (req, res) => {
  const { id, status, comments } = req.body;

  logger.error(req.body);
  const query = `UPDATE student_attandance SET status = '${status}', comments = '${comments}' WHERE id = '${id}' AND DATE(created_at) = CURDATE()`;
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

exports.delete_room = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM rooms WHERE id = '${id}'`;
  connection.query(query, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error Deleting Room", status: "error" });
    } else {
      res.send({ message: "Room Deleted successfully", status: "success" });
    }
  });
};
