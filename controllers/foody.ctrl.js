const DateGenerator = require("../hooks/date");
const connectDatabase = require("../utils/database");
const logger = require("../logger");

const fetchdataById = async (regd_no) => {
  logger.info("fetchdataById", regd_no);
  const date = new Date();
  const Auth = req.session.Auth;
  const connect = await connectDatabase(Auth);

  // Validate input parameters
  if (!regd_no) {
    const error = new Error("Invalid input: regd_no is required");
    logger.error("Error details:", error.stack);
    return Promise.reject({
      result: error,
      status: false,
    });
  }

  return new Promise((resolve, reject) => {
    connect.query(
      `SELECT * FROM hms_food_booking WHERE regd_no = ? AND date = ?`,
      [
        regd_no,
        date.toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      ],
      (err, result) => {
        if (err) {
          logger.error("Database error:", err.stack);
          reject({
            result: err,
            status: false,
          });
        } else {
          if (result.length > 0) {
            resolve({
              result: result,
              status: true,
            });
          } else {
            resolve({
              result: result,
              status: false,
            });
          }
        }
      }
    );
    connect.end();
  });
};

const fetchUserData = async (regd_no) => {
  const Auth = req.session.Auth;
  const connect = await connectDatabase(Auth);
  return new Promise((resolve, reject) => {
    const date = new Date();
    connect.query(
      `SELECT hms_users.*, hms_food_booking.break_fast, hms_food_booking.lunch, hms_food_booking.dinner
      FROM hms_food_booking
      INNER JOIN hms_users ON hms_users.userId = hms_food_booking.regd_no
      WHERE hms_food_booking.regd_no = '${regd_no}' 
      AND hms_food_booking.date = '${date.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })}'`,
      (err, result) => {
        if (err) {
          logger.error("error is", err);
          const data = {
            result: err,
            status: false,
          };
          reject(data);
        } else {
          if (result.length > 0) {
            const data = {
              result: result,
              status: true,
            };
            logger.info(data);
            resolve(data);
          } else {
            const data = {
              result: result,
              status: false,
            };
            logger.info(data);
            resolve(data);
          }
        }
      }
    );
    connect.end();
  });
};
exports.book = async (req, res) => {
  const { regd_no, meal_type, auth_code, branch_id } = req.body;
  const date = DateGenerator();
  const time = Date().slice(16, 21);
  const Auth = req.session.Auth;
  const connect = await connectDatabase(Auth);
  // const auth_code = Math.floor(Math.random() * 1000000);

  try {
    let studentData = await fetchdataById(regd_no);
    console.log(studentData);
    if (studentData?.status === true) {
      const mealField = `${meal_type}`;
      const timeField = `${meal_type}_time`;
      if (studentData?.result[0]?.[mealField] === 0) {
        const query = `UPDATE hms_food_booking SET ${mealField} = '1', ${timeField} = '${time}', auth_code = '${auth_code}' WHERE regd_no = '${regd_no}' and date = '${date}'`;
        connect.query(query, (err, result) => {
          if (err) {
            logger.error(err);
          }
          res.send({
            message: "Booking Successful",
            status: "success",
            data: auth_code,
          });
        });
        connect.end();
      } else {
        res.send({
          message: "Already Booked your food",
          status: "error",
          data: studentData?.result[0].auth_code,
        });
      }
    } else {
      const query = `INSERT INTO hms_food_booking (regd_no,  ${meal_type}, ${meal_type}_time, auth_code, date, branch_id) VALUES ('${regd_no}', '1', '${time}', '${auth_code}', '${date}', '${branch_id}')`;
      connect.query(query, async (err, result) => {
        if (err) {
          logger.error(err);
        }
        let studentData = await fetchdataById(regd_no);
        res.send({
          message: "Booking Successful",
          status: "success",
          data: studentData.result[0],
        });
      });
      connect.end();
    }
  } catch (err) {
    logger.error(err);
    res.send({ message: "Error", status: "error" });
  }
};
exports.getCodes = async (req, res) => {
  const { regd_no } = req.body;
  const date = DateGenerator();
  const Auth = req.session.Auth;
  const connect = await connectDatabase(Auth);
  const query = `SELECT * FROM hms_food_booking WHERE regd_no = '${regd_no}' AND date = '${date}'`;
  connect.query(query, async (err, result) => {
    if (err) {
      logger.error(err);
    }
    if (result.length > 0) {
      logger.error(result[0].regd_no);
      res.send({
        status: "success",
        data: result[0],
      });
    } else {
      res.send({ message: "Code Not Matched", status: "error" });
    }
  });
  connect.end();
};

exports.checkCode = async (req, res) => {
  try {
    const { auth_code } = req.body;
    const date = DateGenerator();
    const Auth = req.session.Auth;
    const connect = await connectDatabase(Auth);
    const query =
      "SELECT * FROM hms_food_booking WHERE auth_code = ? AND date = ?";

    connect.query(query, [auth_code, date], async (err, result) => {
      if (err) {
        logger.error("Database error:", err);
        res
          .status(500)
          .send({ message: "Internal Server Error", status: "error" });
        return;
      }

      if (result.length > 0) {
        logger.info("Code matched:", result[0].regd_no);
        const user_details = await fetchUserData(result[0].regd_no);
        res.send({
          message: "Code Matched",
          status: "success",
          data: user_details,
        });
      } else {
        res.send({ message: "Code Not Matched", status: "error" });
      }
    });
    connect.end();
  } catch (error) {
    logger.error("Error:", error);
    res.status(500).send({ message: "Internal Server Error", status: "error" });
  }
};

exports.create_food_menu = async (req, res) => {
  const { month, year, food_menu, branch_id } = req.body;
  logger.error(food_menu);
  const Auth = req.session.Auth;
  const connect = await connectDatabase(Auth);
  const duplicate = `SELECT * FROM hms_food_menu WHERE month = '${month}' AND year = '${year}' AND branch_id = '${branch_id}'`;
  const query = `INSERT INTO hms_food_menu (month, year, menu_data, branch_id) VALUES ('${month}', '${year}', '${food_menu}', '${branch_id}')`;
  connect.query(duplicate, (err, result) => {
    if (err) {
      logger.error(err);
    }
    if (result.length > 0) {
      res.send({
        message: "Food Menu Already Created",
        status: "error",
      });
      return;
    } else {
      connect.query(query, (err, result) => {
        if (err) {
          logger.error(err);
        }
        res.send({
          message: "Food Menu Created",
          status: "success",
        });
      });
    }
  });
  connect.end();
};

exports.get_last_menu = async (req, res) => {
  const query = `SELECT * FROM hms_food_menu ORDER BY id DESC LIMIT 1`;
  const Auth = req.session.Auth;
  const connect = await connectDatabase(Auth);
  connect.query(query, (err, result) => {
    if (err) {
      logger.error(err);
    }
    res.send({
      message: "Food Menu Fetched",
      status: "success",
      data: result[0],
    });
  });
  connect.end();
};

exports.get_all_menu = async (req, res) => {
  const query = `SELECT * FROM hms_food_menu`;
  const Auth = req.session.Auth;
  const connect = await connectDatabase(Auth);
  connect.query(query, (err, result) => {
    if (err) {
      logger.error(err);
    }
    res.send({
      message: "All Food Menu Fetched",
      status: "success",
      data: result,
    });
  });
  connect.end();
};

exports.today_bookings = async (req, res) => {
  const Auth = req.session.Auth;
  const connect = await connectDatabase(Auth);
  const date = DateGenerator();
  const query = `SELECT hms_food_booking.*,hms_users.* FROM hms_food_booking
  INNER JOIN hms_users ON hms_users.userId = hms_food_booking.regd_no
  WHERE date = '${date}'`;
  connect.query(query, (err, result) => {
    if (err) {
      logger.error(err);
    }
    res.send({
      message: "Today Bookings Fetched",
      status: "success",
      data: result,
    });
  });
  connect.end();
};

exports.update_menu = async (req, res) => {
  const { id, menu_data } = req.body;
  const Auth = req.session.Auth;
  const connect = await connectDatabase(Auth);
  const query = `UPDATE hms_food_menu SET menu_data = '${menu_data}' WHERE id = '${id}'`;
  connect.query(query, (err, result) => {
    if (err) {
      logger.error(err);
    }
    res.send({
      message: "Food Menu Updated Successfully",
      status: "success",
    });
  });
  connect.end();
};

exports.delete_menu = async (req, res) => {
  const { id } = req.body;
  const Auth = req.session.Auth;
  const connect = await connectDatabase(Auth);
  const query = `DELETE FROM hms_food_menu WHERE id = '${id}'`;
  connect.query(query, (err, result) => {
    if (err) {
      logger.error(err);
    }
    res.send({
      message: "Food Menu Deleted Successfully",
      status: "success",
    });
  });
  connect.end();
};

exports.food_booking_history = async (req, res) => {
  const { regd_no, meal_type, approved_by, branch_id, status } = req.body;
  const Auth = req.session.Auth;
  const connect = await connectDatabase(Auth);
  const taken_at = new Date().toISOString().slice(0, 19).replace("T", " ");
  const query = `INSERT INTO hms_food_booking_history (regd_no, meal_type, taken_at, approved_by, branch_id, status) VALUES ('${regd_no}', '${meal_type}', '${taken_at}', '${approved_by}', '${branch_id}', '${status}')`;
  connect.query(query, (err, result) => {
    if (err) {
      logger.error(err);
    }
    const query2 = `Update hms_food_booking SET auth_code= null WHERE regd_no = '${regd_no}'`;
    connect.query(query2, (err, result) => {
      if (err) {
        logger.error(err);
      }
      res.send({
        message: "Food Allocate Successfully",
        status: "success",
      });
    });
  });
  connect.end();
};
