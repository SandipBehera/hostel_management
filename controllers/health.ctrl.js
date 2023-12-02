const connection = require("../utils/database");
const DateGenerator = require("../hooks/date");
const { getIO } = require("../socket/socket");

exports.add_patient = (req, res) => {
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
  } = req.body;
  console.log(req.body);

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
      console.error(err);
      return res
        .status(500)
        .send({ message: "Error uploading file", status: "error" });
    }

    connection.query(
      `INSERT INTO patient (patientname, patient_regdno, hostelid, floorid, roomno, date, time, reason, doctorname, upload_preception) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ],
      (err, result) => {
        if (err) {
          console.error(err);
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
  });
};

exports.getAllPatient = (req, res) => {
  connection.query(`SELECT * FROM patient`, (err, result) => {
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
};
