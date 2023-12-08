// Purpose: Employee controller file
const connection = require("../utils/database");
const DateConvertor = require("../hooks/DateConvertor");
const _ = require("lodash");

exports.getEmployee = (req, res) => {
  connection.query(`SELECT * FROM users_employee`, (err, result) => {
    if (err) throw err;
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
  } = req.body;
  console.log(req.body);
  const join_date = DateConvertor(doj);

  let upload_employee_img = "";
  if (!_.isEmpty(req.files["file"])) {
    const emp_pic = req.files["file"];
    if (!emp_pic) {
      return res
        .status(400)
        .send({ message: "No file uploaded", status: "error" });
    }
    emp_pic.mv(`upload/employee/${upload_employee_img}`, (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .send({ message: "Error uploading file", status: "error" });
      }
    });
    upload_employee_img = `${Date.now()}_${emp_pic.name}`;
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
        user_type
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
            '${userType}'
        )
    `,
    (err, result) => {
      if (err) throw err;
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
