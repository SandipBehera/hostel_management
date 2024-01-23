const connectDatabase = require("../utils/database");
const logger = require("../logger");

exports.createFine = async (req, res) => {
  console.log(req.body);
  const { studentid, fineAmount, reason, branch_id } = req.body;

  const image = req.files?.upload_image || req.body.upload_image;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  if (!image) {
    return res
      .status(400)
      .send({ message: "No file uploaded", status: "error" });
  }
  let upload_image = `${Date.now()}_${image.name}`;
  console.log(typeof image);
  if (typeof image !== "string") {
    image.mv(`upload/fine/${upload_image}`, (err) => {
      if (err) {
        logger.error(err);
        return res
          .status(500)
          .send({ message: "Error uploading file", status: "error" });
      }
    });
  } else {
    upload_image = image;
  }
  studentid.forEach((element) => {
    connection.query(
      `INSERT INTO hms_fine (studentid, fine, reason,image, branch_id) VALUES (?, ?, ?, ?,?)`,
      [element, fineAmount, reason, upload_image, branch_id],
      (err, result) => {
        if (err) {
          logger.error(err);
          return res
            .status(500)
            .send({ message: "Error creating fine", status: "error" });
        }

        return res
          .status(200)
          .send({ message: "Fine created", status: "success" });
      }
    );
  });
  connection.end();
};
exports.getFine = async (req, res) => {
  const Auth = req.session.Auth;
  const { branch_id } = req.params;
  const connection = await connectDatabase(Auth);
  connection.query(
    `SELECT hms_fine.*,hms_users.name FROM hms_fine
    LEFT JOIN hms_users ON hms_fine.studentid = hms_users.registration_no
    where hms_fine.branch_id = ?`,
    [branch_id],
    (err, result) => {
      if (err) {
        logger.error(err);
        return res
          .status(500)
          .send({ message: "Error fetching fine", status: "error" });
      }

      return res
        .status(200)
        .send({ message: "Fine fetched", status: "success", data: result });
    }
  );
  connection.end();
};
