const connectDatabase = require("../utils/database");
const { getIO } = require("../socket/socket");
const logger = require("../logger");

exports.create_complaint = async (req, res) => {
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
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(
    "INSERT INTO complaints (issue_type, issued_by, hostel_id, floor_no, assigned_to, status, details, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      issue_type,
      issued_by,
      hostel_id,
      floor_no,
      assigned_to,
      status,
      details,
      branch_id,
    ],
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
        branch_id,
      });

      res.send({
        message: `${issue_type} created successfully`,
        status: "success",
      });
    }
  );
};
exports.get_complaints = async (req, res) => {
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(
    `SELECT DISTINCT
    hms_complaints.*,
    assigned_to_employee.emp_name AS Assigned_to,
    COALESCE(issuer_user.name, issuer_employee_user.emp_name) AS Issued_by
FROM hms_complaints
LEFT JOIN hms_users_employee AS assigned_to_employee ON hms_complaints.assigned_to = assigned_to_employee.emp_id
LEFT JOIN hms_users AS issuer_user ON hms_complaints.issued_by = issuer_user.userId
LEFT JOIN hms_users_employee AS issuer_employee_user ON hms_complaints.issued_by = issuer_employee_user.emp_id;
;`,
    (err, result) => {
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
    }
  );
};
exports.update_complaint = async (req, res) => {
  const { complaint_id, status, content, assignedEmployee } = req.body;
  const escapedDetails = content.replace(/'/g, "\\'");
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(
    `UPDATE complaints SET status = '${status}',details= '${escapedDetails}', assigned_to='${assignedEmployee}' WHERE id = ${complaint_id}`,
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
exports.get_complaints_by_id = async (req, res) => {
  const { id } = req.params;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(
    `SELECT DISTINCT
    complaints.*,
    hms_users.name,
    hms_rooms.hostel_name,
    issued_by_employee.emp_name AS issued_by_name,
    assigned_to_employee.emp_name AS assigned_to_name
FROM complaints
LEFT JOIN hms_users ON complaints.issued_by = hms_users.userId
LEFT JOIN hms_users_employee AS issued_by_employee ON complaints.issued_by = issued_by_employee.emp_id
LEFT JOIN hms_rooms ON complaints.hostel_id = hms_rooms.id
LEFT JOIN hms_users_employee AS assigned_to_employee ON complaints.assigned_to = assigned_to_employee.emp_id
WHERE complaints.id = '${id}'`,
    (err, result) => {
      if (err) {
        logger.error(err);
        res.send({ message: "Error fetching complaints", status: "error" });
        return;
      }
      if (result?.length > 0) {
        res.send({
          message: "Complaints fetched successfully",
          status: "success",
          data: result,
        });
      } else {
        res.send({
          message: "No Complaints Found",
          status: "error",
          data: [],
        });
      }
    }
  );
};
