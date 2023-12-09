const connection = require("../utils/database");
const DateConvertor = require("../hooks/DateConvertor");
const logger = require("../logger");

exports.getAllStocks = (req, res) => {
  connection.query(`SELECT * FROM master_stock`, (err, result) => {
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
};
exports.addStock = (req, res) => {
  const {
    item_name,
    item_for,
    quantity,
    price_per,
    total_price,
    purchased_from,
    purchase_date,
    branch_id,
  } = req.body;
  console.log(req.body);
  const date = DateConvertor(purchase_date);
  connection.query(
    `INSERT INTO master_stock (
            item_name,
    item_for,
    quantity,
    price_per,
    total_price,
    purchased_from,
    purchase_date,
    branch_id
        ) VALUES (
            '${item_name}',
            '${item_for}',
            '${quantity}',
            '${price_per}',
            '${total_price}',
            '${purchased_from}',
            '${date}',
            '${branch_id}'
        )`,
    (err, result) => {
      if (err) {
        logger.error(err);
      }

      if (result) {
        res.send({
          data: result.insertId,
          message: `${item_name} Stock Added`,
          status: "success",
        });
      } else {
        res.send({ message: "No Stock Added", staus: "error" });
      }
    }
  );
};
exports.createItem = (req, res) => {
  const { item_name, item_for, branch_id } = req.body;
  connection.query(
    `INSERT INTO items (
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
};
exports.getItems = (req, res) => {
  connection.query(`SELECT * FROM items`, (err, result) => {
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
};
