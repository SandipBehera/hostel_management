const connection = require("../utils/database");
const { getIO } = require("../socket/socket");

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
  } = req.body;

  connection.query(
    `INSERT INTO complaints (issue_type,issued_by,hostel_id,floor_no,assigned_to,status,details) VALUES ('${issue_type}', '${issued_by}', '${hostel_id}', '${floor_no}','${assigned_to}','${status}','${details}')`,
    (err, result) => {
      if (err) {
        console.error(err);
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
