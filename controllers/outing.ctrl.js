const connectDatabase = require("../utils/database");
const logger = require("../logger");

exports.add_outing = async (req, res) => {
  const { studentid, date, destination, reason, branch_id } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(
    `INSERT INTO hms_outing (studentid, date, destination, reason, branch_id) VALUES (?, ?, ?, ?, ?)`,
    [studentid, date, destination, reason, branch_id],
    (err, result) => {
      if (err) {
        logger.error(err);
        return res
          .status(500)
          .send({ message: "Error creating outing", status: "error" });
      }

      return res
        .status(200)
        .send({ message: "Outing created", status: "success" });
    }
  );
};
exports.get_outing = async (req, res) => {
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(`SELECT * FROM hms_outing`, (err, result) => {
    if (err) {
      logger.error(err);
      return res
        .status(500)
        .send({ message: "Error fetching outing", status: "error" });
    }

    return res
      .status(200)
      .send({ message: "Outing fetched", status: "success", data: result });
  });
};

exports.approve_outing = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(
    `UPDATE hms_outing SET status = '${status}' WHERE id = ?`,
    [id],
    (err, result) => {
      if (err) {
        logger.error(err);
        return res
          .status(500)
          .send({ message: "Error approving outing", status: "error" });
      }

      return res
        .status(200)
        .send({ message: "Outing approved", status: "success" });
    }
  );
};
