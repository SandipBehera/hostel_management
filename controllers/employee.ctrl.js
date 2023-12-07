// Purpose: Employee controller file
const connection = require("../utils/database");
const DateConvertor = require("../hooks/DateConvertor");

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
    name,
    email,
    contact,
    address,
    employeeId,
    designation,
    aadhar,
    pan,
    account,
    bank,
    ifsc,
    doj,
  } = req.body;
  console.log(req.body);
  const emp_pic = req.files["file"];
  const join_date = DateConvertor(doj);
  console.log(emp_pic);
  if (!emp_pic) {
    return res
      .status(400)
      .send({ message: "No file uploaded", status: "error" });
  }

  const upload_employee_img = `${Date.now()}_${emp_pic.name}`;

  emp_pic.mv(`upload/employee/${upload_employee_img}`, (err) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .send({ message: "Error uploading file", status: "error" });
    }
    connection.query(
      `Insert into users_employee (
        emp_name,
        emp_email,
        emp_phone,
        address,
        employee_id,
        emp_designation,
        aadhar_no,
        pan_no,
        bank_ac_no,
        bank_ac_name,
        bank_ifsc,
        emp_dob,
        emp_pic
        )
        values(
            '${name}',
            '${email}',
            '${contact}',
            '${address}',
            '${employeeId}',
            '${designation}',
            '${aadhar}',
            '${pan}',
            '${account}',
            '${bank}',
            '${ifsc}',
            '${join_date}',
            '${upload_employee_img}'
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
  });
};
