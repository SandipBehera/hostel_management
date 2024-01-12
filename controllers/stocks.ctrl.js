const connectDatabase = require("../utils/database");
const DateConvertor = require("../hooks/DateConvertor");
const logger = require("../logger");

exports.getAllStocks = async (req, res) => {
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(`SELECT * FROM hms_master_stock`, (err, result) => {
    if (err) {
    }

    if (result.length > 0) {
      res.send({
        data: result,
        message: "Stock List",
        status: "success",
      });
    } else {
      res.send({ message: "No Stock Found", staus: "error" });
    }
  });
  connection.end();
};
exports.addStock = async (req, res) => {
  const { purchased_from, branch_id, allItems, total_price } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  const promises = [];

  allItems.forEach((item) => {
    const { item_name, item_for, quantity, price, created_at } = item;
    const date = DateConvertor(created_at);

    const promise = new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO hms_master_stock (
          item_name,
          item_for,
          quantity,
          price_per,
          total_price,
          purchased_from,
          purchase_date,
          branch_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item_name,
          item_for,
          quantity,
          price,
          total_price,
          purchased_from,
          date,
          branch_id,
        ],
        (err, result) => {
          if (err) {
            logger.error(err);
            reject(err);
          } else {
            console.log(`${item_name} Stock Added with ID: ${result.insertId}`);
            resolve(result);
          }
        }
      );
      connection.end();
    });

    promises.push(promise);
  });

  Promise.all(promises)
    .then(() => {
      // Send a response after all promises have resolved
      res.send({
        message: "Stocks Added",
        status: "success",
      });
    })
    .catch(() => {
      res.send({
        message: "Stocks Not Added",
        status: "error",
      });
    });
};

exports.createItem = async (req, res) => {
  const { item_name, item_for, branch_id } = req.body;
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(
    `INSERT INTO hms_items (
                item_name,
                item_for,
                branch_id
            ) VALUES (
                '${item_name}',
                '${item_for}',
                '${branch_id}'
            )`,
    (err, result) => {
      if (err) {
        logger.error(err);
      }

      if (result) {
        res.send({
          data: result,
          message: `${item_name} Item Added`,
          status: "success",
        });
      } else {
        res.send({ message: "No Item Added", staus: "error" });
      }
    }
  );
  connection.end();
};
exports.getItems = async (req, res) => {
  const Auth = req.session.Auth;
  const connection = await connectDatabase(Auth);
  connection.query(`SELECT * FROM hms_items`, (err, result) => {
    if (err) {
      logger.error(err);
    }

    if (result.length > 0) {
      res.send({
        data: result,
        message: "Item List",
        status: "success",
      });
    } else {
      res.send({ message: "No Item Found", staus: "error" });
    }
  });
  connection.end();
};
