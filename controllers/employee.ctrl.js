// Purpose: Employee controller file
const connection = require("../utils/database");
const DateConvertor = require("../hooks/DateConvertor");
const _ = require("lodash");
const logger = require("../logger");

exports.getEmployee = (req, res) => {
  connection.query(`SELECT * FROM users_employee`, (err, result) => {
    if (err) {
      logger.error(err);
    }
    if (result.length > 0) {
      res.send({
        data: result,
        message: "Employee List",
        status: "success",
      });
    } else {
      res.send({ message: "No Employee Found", staus: "error" });
    }
  });
};
exports.addEmployee = (req, res) => {
  const {
    employeeId,
    name,
    email,
    contact,
    address,
    employee_reg_no,
    designation,
    aadhar,
    pan,
    account,
    bank,
    ifsc,
    doj,
    userType,
    branch_id,
  } = req.body;
  console.log(req.body);
  const join_date = DateConvertor(doj);

  let upload_employee_img = "";
  if (req.files?.file) {
    const emp_pic = req.files["file"];
    if (!emp_pic) {
      return res
        .status(400)
        .send({ message: "No file uploaded", status: "error" });
    }
    upload_employee_img = `${Date.now()}_${emp_pic.name}`;
    emp_pic.mv(`upload/employee/${upload_employee_img}`, (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .send({ message: "Error uploading file", status: "error" });
      }
    });
  } else {
    upload_employee_img = req.body.emp_pic;
  }

  connection.query(
    `Insert into users_employee (
        emp_id,
        emp_name,
        emp_email,
        emp_phone,
        address,
        employee_reg_no,
        emp_designation,
        aadhar_no,
        pan_no,
        bank_ac_no,
        bank_ac_name,
        bank_ifsc,
        emp_dob,
        emp_pic,
        user_type,
        branch_id
        )
        values(
            '${employeeId}',
            '${name}',
            '${email}',
            '${contact}',
            '${address}',
            '${employee_reg_no}',
            '${designation}',
            '${aadhar}',
            '${pan}',
            '${account}',
            '${bank}',
            '${ifsc}',
            '${join_date}',
            '${upload_employee_img}',
            '${userType}',
            '${branch_id}'
        )
    `,
    (err, result) => {
      if (err) {
        logger.error(err);
      }
      if (result) {
        res.send({
          message: "Employee Added Successfull",
          status: "success",
        });
      } else {
        res.send({ message: "Something Wrong Happened", staus: "error" });
      }
    }
  );
};

exports.updateEmployee = (req, res) => {
  const {
    employeeId,
    name,
    email,
    contact,
    address,
    employee_reg_no,
    designation,
    aadhar,
    pan,
    account,
    bank,
    ifsc,
    doj,
    userType,
    branch_id,
  } = req.body;
  console.log(req.body);
  const join_date = DateConvertor(doj);

  let upload_employee_img = "";
  if (req.files?.file) {
    const emp_pic = req.files["file"];
    if (!emp_pic) {
      return res
        .status(400)
        .send({ message: "No file uploaded", status: "error" });
    }
    upload_employee_img = `${Date.now()}_${emp_pic.name}`;
    emp_pic.mv(`upload/employee/${upload_employee_img}`, (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .send({ message: "Error uploading file", status: "error" });
      }
    });
  } else {
    upload_employee_img = req.body.emp_pic;
  }

  connection.query(
    `UPDATE users_employee SET
        emp_name = '${name}',
        emp_email = '${email}',
        emp_phone = '${contact}',
        address = '${address}',
        employee_reg_no = '${employee_reg_no}',
        emp_designation = '${designation}',
        aadhar_no = '${aadhar}',
        pan_no = '${pan}',
        bank_ac_no = '${account}',
        bank_ac_name = '${bank}',
        bank_ifsc = '${ifsc}',
        emp_dob = '${join_date}',
        emp_pic = '${upload_employee_img}',
        user_type = '${userType}',
        branch_id = '${branch_id}'
        WHERE emp_id = '${employeeId}'
    `,
    (err, result) => {
      if (err) {
        logger.error(err);
      }
      if (result) {
        res.send({
          message: "Employee Updated Successfull",
          status: "success",
        });
      } else {
        res.send({ message: "Something Wrong Happened", staus: "error" });
      }
    }
  );
};

exports.assignHostel = (req, res) => {
  const { employeeId, hostel_id, branch_id } = req.body;
  connection.query(
    `UPDATE users_employee SET assigned_hostel_id = '${hostel_id}' WHERE emp_id = '${employeeId}'`,
    (err, result) => {
      if (err) {
        logger.error(err);
      }
      if (result) {
        const query = `INSERT INTO user_room_assign_history (user_id, hostel_id,branch_id) VALUES (?, ?, ?)`; // Insert into user_room_assign_history
        connection.query(
          query,
          [employeeId, hostel_id, branch_id],
          (err, result) => {
            if (err) {
              logger.error(err);
            }
            if (result) {
              res.send({
                message: "Hostel Assigned Successfull",
                status: "success",
              });
            } else {
              res.send({
                message: "Something Wrong Happened while instering history",
                staus: "error",
              });
            }
          }
        );
      } else {
        res.send({ message: "Something Wrong Happened", staus: "error" });
      }
    }
  );
};
