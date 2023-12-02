const connection = require("../utils/database");

exports.add_outing = (req, res) => {
  const { studentid, date, destination, reason } = req.body;

  connection.query(
    `INSERT INTO outing (studentid, date, destination, reason) VALUES (?, ?, ?, ?)`,
    [studentid, date, destination, reason],
    (err, result) => {
      if (err) {
        console.error(err);
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
exports.get_outing = (req, res) => {
  connection.query(`SELECT * FROM outing`, (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .send({ message: "Error fetching outing", status: "error" });
    }

    return res
      .status(200)
      .send({ message: "Outing fetched", status: "success", data: result });
  });
};

exports.approve_outing = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  connection.query(
    `UPDATE outing SET status = '${status}' WHERE id = ?`,
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
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
