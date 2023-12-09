const connection = require("../utils/database");
const { getIO } = require("../socket/socket");
const logger = require("../logger");

exports.create_complaint = (req, res) => {
  const io = getIO(); // Get the io instance from the socket.js file

  const {
    issue_type,
    issued_by,
    hostel_id,
    floor_no,
    assigned_to,
    status,
    details,
    branch_id,
  } = req.body;

  connection.query(
    `INSERT INTO complaints (issue_type,issued_by,hostel_id,floor_no,assigned_to,status,details,branch_id) VALUES ('${issue_type}', '${issued_by}', '${hostel_id}', '${floor_no}','${assigned_to}','${status}','${details}','${branch_id}')`,
    (err, result) => {
      if (err) {
        logger.error(err);
        res.send({ message: "Error creating complaints", status: "error" });
        return;
      }

      // Emit the event inside the connection handler
      io.emit("newComplaint", {
        id: result.insertId,
        issue_type,
        issued_by,
        hostel_id,
        floor_no,
        assigned_to,
        status,
        details,
      });

      res.send({
        message: "Complaints created successfully",
        status: "success",
      });
    }
  );
};
exports.get_complaints = (req, res) => {
  connection.query(`SELECT * FROM complaints`, (err, result) => {
    if (err) {
      console.log(err);
      res.send({ message: "Error fetching complaints", status: "error" });
    } else {
      res.send({
        message: "Complaints fetched successfully",
        status: "success",
        data: result,
      });
    }
  });
};
exports.update_complaint = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  connection.query(
    `UPDATE complaints SET status = '${status}' WHERE id = ${id}`,
    (err, result) => {
      if (err) {
        logger.error(err);
        res.send({ message: "Error updating complaints", status: "error" });
        return;
      }

      res.send({
        message: "Complaints updated successfully",
        status: "success",
      });
    }
  );
};
exports.get_complaints_by_id = (req, res) => {
  const { id } = req.params;

  connection.query(
    `SELECT * FROM complaints WHERE id = ${id}`,
    (err, result) => {
      if (err) {
        logger.error(err);
        res.send({ message: "Error fetching complaints", status: "error" });
        return;
      }

      res.send({
        message: "Complaints fetched successfully",
        status: "success",
        data: result,
      });
    }
  );
};
