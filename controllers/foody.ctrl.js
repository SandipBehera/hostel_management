const connect = require("../utils/database");

const fetchdataById = (regd_no) => {
  console.log("fetchdataById", regd_no);
  const date = new Date();
  return new Promise((resolve, reject) => {
    connect.query(
      `SELECT * FROM food_booking WHERE regd_no = '${regd_no}' AND date = '${date.toLocaleDateString(
        "en-CA",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      )}' `,
      (err, result) => {
        if (err) {
          console.log("error is", err);
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
            console.log(data);
            resolve(data);
          } else {
            const data = {
              result: result,
              status: false,
            };
            console.log(data);
            resolve(data);
          }
        }
      }
    );
  });
};
const fetchUerData = (regd_no) => {
  return new Promise((resolve, reject) => {
    connect.query(
      `SELECT * FROM users WHERE username = '${regd_no}'`,
      (err, result) => {
        if (err) {
          console.log("error is", err);
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
            console.log(data);
            resolve(data);
          } else {
            const data = {
              result: result,
              status: false,
            };
            console.log(data);
            resolve(data);
          }
        }
      }
    );
  });
};
exports.book = async (req, res) => {
  const { regd_no, meal_type } = req.body;
  const date = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = Date().slice(16, 21);
  const auth_code = Math.floor(Math.random() * 1000000);

  try {
    let studentData = await fetchdataById(regd_no);

    if (studentData?.status === true) {
      const mealField = `${meal_type}`;
      const timeField = `${meal_type}_time`;

      if (studentData?.result[0]?.[mealField] === 0) {
        const query = `UPDATE food_booking SET ${mealField} = '1', ${timeField} = '${time}', auth_code = '${auth_code}' WHERE regd_no = '${regd_no}'`;
        connect.query(query, (err, result) => {
          if (err) throw err;
          res.send({
            message: "Booking Successful",
            status: "success",
            data: auth_code,
          });
        });
      } else {
        res.send({
          message: "Already Booked your food",
          status: "error",
          data: studentData?.result[0].auth_code,
        });
      }
    } else {
      const query = `INSERT INTO food_booking (regd_no,  ${meal_type}, ${meal_type}_time, auth_code, date) VALUES ('${regd_no}', '1', '${time}', '${auth_code}', '${date}')`;
      connect.query(query, async (err, result) => {
        if (err) throw err;
        let studentData = await fetchdataById(regd_no);
        res.send({
          message: "Booking Successful",
          status: "success",
          data: studentData.result[0],
        });
      });
    }
  } catch (err) {
    console.log(err);
    res.send({ message: "Error", status: "error" });
  }
};
exports.getCodes = async (req, res) => {
  const { regd_no } = req.body;
  const date = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const query = `SELECT * FROM food_booking WHERE regd_no = '${regd_no}' AND date = '${date}'`;
  connect.query(query, async (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      console.log(result[0].regd_no);
      res.send({
        status: "success",
        data: result[0],
      });
    } else {
      res.send({ message: "Code Not Matched", status: "error" });
    }
  });
};

exports.checkCode = async (req, res) => {
  const { auth_code } = req.body;
  const date = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const query = `SELECT * FROM food_booking WHERE auth_code = '${auth_code}' AND date = '${date}'`;
  connect.query(query, async (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      console.log(result[0].regd_no);
      const user_details = await fetchUerData(result[0].regd_no);
      res.send({
        message: "Code Matched",
        status: "success",
        data: user_details,
      });
    } else {
      res.send({ message: "Code Not Matched", status: "error" });
    }
  });
};
