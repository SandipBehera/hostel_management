const connectDatabase = require("../utils/database");
const DateGenerator = require("../hooks/date");
const { getIO } = require("../socket/socket");
const logger = require("../logger");

exports.add_patient = async (req, res) => {
  const {
    patientname,
    patient_regdno,
    hostelid,
    floorid,
    roomno,
    date,
    time,
    reason,
    doctorname,
    branch_id,
  } = req.body;
  console.log(req.body);
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  // Assuming you have the 'file' field in your form
  const file = req.files["file"];
  console.log(file);
  if (!file) {
    return res
      .status(400)
      .send({ message: "No file uploaded", status: "error" });
  }

  const upload_preception = `${Date.now()}_${file.name}`;

  file.mv(`upload/${upload_preception}`, (err) => {
    if (err) {
      logger.error(err);
      return res
        .status(500)
        .send({ message: "Error uploading file", status: "error" });
    }

    connection.query(
      `INSERT INTO hms_patient (patientname, patient_regdno, hostelid, floorid, roomno, date, time, reason, doctorname, upload_preception, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        patientname,
        patient_regdno,
        hostelid,
        floorid,
        roomno,
        date,
        time,
        reason,
        doctorname,
        upload_preception,
        branch_id,
      ],
      (err, result) => {
        if (err) {
          logger.error(err);
          return res
            .status(500)
            .send({ message: "Error creating patient", status: "error" });
        }

        res.send({
          message: "Patient created successfully",
          status: "success",
        });
      }
    );
    connection.end();
  });
};

exports.getAllPatient = async (req, res) => {
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(`SELECT * FROM hms_patient`, (err, result) => {
    if (err) {
      console.log(err);
      res.send({ message: "Error fetching patient", status: "error" });
    } else {
      res.send({
        message: "patient fetched successfully",
        status: "success",
        data: result,
      });
    }
  });
  connection.end();
};
