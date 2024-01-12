const connectDatabase = require("../utils/database");
const logger = require("../logger");

exports.getAllConfigs = async (req, res) => {
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(`SELECT * FROM hms_hostel_config`, (err, result) => {
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
  connection.end();
};
exports.addConfig = async (req, res) => {
  const { config_type, config_type_name, branch_id } = req.body;
  const removedUnderscrore = config_type.replace(/_/g, " ");
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  // Check if the record already exists
  connection.query(
    "SELECT * FROM hms_hostel_config WHERE config_type = ? AND branch_id = ?",
    [config_type, branch_id],
    (selectErr, selectResult) => {
      if (selectErr) {
        logger.error(selectErr);
        res
          .status(500)
          .send({ message: "Internal Server Error", status: "error" });
        return;
      }

      if (selectResult.length === 0) {
        // Record doesn't exist, perform an INSERT
        connection.query(
          "INSERT INTO hms_hostel_config (config_type, config_type_name, branch_id) VALUES (?, ?, ?)",
          [config_type, config_type_name, branch_id],
          (insertErr, insertResult) => {
            if (insertErr) {
              logger.error(insertErr);
              res
                .status(500)
                .send({ message: "Internal Server Error", status: "error" });
              return;
            }
            res.send({
              data: insertResult,
              message: `${removedUnderscrore} Config Added`,
              status: "success",
            });
          }
        );
      } else {
        // Record exists, update config_type_name by appending new values
        const existingConfig = selectResult[0];

        // Log existing values
        console.log(
          "existingConfig.config_type_name:",
          existingConfig.config_type_name
        );
        console.log("config_type_name:", config_type_name);

        // Try parsing JSON
        try {
          const updatedDataArray = [
            ...(existingConfig.config_type_name.data || []),
            ...(JSON.parse(config_type_name).data || []),
          ];

          console.log(updatedDataArray);
          connection.query(
            "UPDATE hms_hostel_config SET config_type_name = ? WHERE config_type = ? AND branch_id = ?",
            [
              JSON.stringify({ data: updatedDataArray }),
              config_type,
              branch_id,
            ],
            (updateErr, updateResult) => {
              if (updateErr) {
                logger.error(updateErr);
                res
                  .status(500)
                  .send({ message: "Internal Server Error", status: "error" });
                return;
              }
              res.send({
                data: updateResult,
                message: `${removedUnderscrore} Config Updated`,
                status: "success",
              });
            }
          );
        } catch (jsonParseError) {
          // Log JSON parsing error
          console.error("JSON Parsing Error:", jsonParseError);
          res
            .status(400)
            .send({ message: "Invalid JSON data", status: "error" });
        }
      }
    }
  );
  connection.end();
};

exports.getConfigByType = async (req, res) => {
  const { config_type } = req.params;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  console.log(config_type);
  connection.query(
    `SELECT * FROM hms_hostel_config where config_type='${config_type}'`,
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
  connection.end();
};
