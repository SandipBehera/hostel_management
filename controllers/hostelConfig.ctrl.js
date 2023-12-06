const connection = require("../utils/database");

exports.getAllConfigs = (req, res) => {
  connection.query(`SELECT * FROM hostel_config`, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send({
        data: result,
        message: "Hostel Config List",
        status: "success",
      });
    } else {
      res.send({ message: "No Config Found", staus: "error" });
    }
  });
};
exports.addConfig = (req, res) => {
  const { config_type, config_type_name } = req.body;

  connection.query(
    `Insert into hostel_config (
            config_type,
            config_type_name
        ) values (
            '${config_type}',
            '${config_type_name}'
        )`,
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.send({
          data: result,
          message: `${config_type} Config Added`,
          status: "success",
        });
      } else {
        res.send({ message: "No Config Added", staus: "error" });
      }
    }
  );
};

exports.getConfigByType = (req, res) => {
  const { config_type } = req.params;
  console.log(config_type);
  connection.query(
    `SELECT * FROM hostel_config where config_type='${config_type}'`,
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.send({
          data: result,
          message: `${config_type} Config List`,
          status: "success",
        });
      } else {
        res.send({ message: "No Config Found", staus: "error" });
      }
    }
  );
};
