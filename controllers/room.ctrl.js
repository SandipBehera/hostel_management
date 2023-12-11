const connection = require("../utils/database");
const logger = require("../logger");

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
  connection.query(`SELECT * FROM rooms`, (err, result) => {
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

exports.Assign_rooms = (req, res) => {
  logger.error(req.body);
  const { user_id, hostel_id, floor_id, room_id, branch_id } = req.body;
  const query = `INSERT INTO user_room_assign (user_id, hostel_id,floor_id,room_id,branch_id) VALUES ('${user_id}', '${hostel_id}', '${floor_id}', '${room_id}','${branch_id}')`;
  connection.query(query, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error Assigning rooms", status: "error" });
    } else {
      res.send({ message: "Rooms Assigned successfully", status: "success" });
    }
  });
};

exports.Get_Student_By_Room = (req, res) => {
  const { hostel_id, floor_id, room_id } = req.body;
  // const query = `SELECT users.* FROM users INNER JOIN user_room_assign ON users.userId = user_room_assign.user_id LEFT JOIN  WHERE user_room_assign.hostel_id = '${hostel_id}' AND user_room_assign.floor_id = '${floor_id}' AND user_room_assign.room_id = '${room_id}'`;
  const query = `
    SELECT
      users.*,
      student_attandance.*,
      CASE WHEN student_attandance.user_id IS NOT NULL THEN true ELSE false END AS attendance_taken
    FROM
      users
      INNER JOIN user_room_assign ON users.userId = user_room_assign.user_id
      LEFT JOIN student_attandance ON users.userId = student_attandance.user_id AND user_room_assign.user_id = student_attandance.user_id 
    WHERE
      user_room_assign.hostel_id = '${hostel_id}'
      AND user_room_assign.floor_id = '${floor_id}'
      AND user_room_assign.room_id = '${room_id}'
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
  const query = `INSERT INTO student_attandance (user_id, hostel_name,room_number, status, comments, branch_id) VALUES ('${user_id}', '${hostel_id}', '${room_id}', '${status}', '${
    comments !== null ? comments : ""
  }','${branch_id}')`;
  connection.query(query, (err, result) => {
    if (err) {
      logger.error(err);
      res.send({ message: "Error Taking Attendance", status: "error" });
    } else {
      res.send({ message: "Attendance Taken successfully", status: "success" });
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
