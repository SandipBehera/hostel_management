const connection = require("../utils/database");
const logger = require("../logger");

exports.getAllConfigs = (req, res) => {
  connection.query(`SELECT * FROM hostel_config`, (err, result) => {
    if (err) {
      logger.error(err);
    }
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
    `INSERT INTO hostel_config (
        config_type,
        config_type_name
    ) VALUES (
        '${config_type}',
        '${config_type_name}'
    ) ON DUPLICATE KEY UPDATE
        config_type_name = JSON_MERGE_PRESERVE(
            IFNULL(config_type_name, JSON_ARRAY()),
            VALUES(config_type_name)
        )`,
    (err, result) => {
      if (err) {
        logger.error(err);
      }
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
      if (err) {
        logger.error(err);
      }
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
