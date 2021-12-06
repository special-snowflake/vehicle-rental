const mysql = require('mysql');
const db = require('../config/db');

const {grabLocalYMD} = require('../helpers/collection');

const getTestimony = (req, res) => {
  let order = '';
  if (req.query.orderBy) {
    const orderBy = req.query.orderBy;
    console.log(orderBy);
    order =
      orderBy == 'date'
        ? ' ORDER BY testimony.date_added '
        : orderBy == 'rate'
        ? ' ORDER BY testimony.rate '
        : '';
  }
  let sort = '';
  if (req.query.sort) {
    sort = req.query.sort == 'desc' ? 'DESC' : 'ASC';
  }
  const sqlQuery = `SELECT 
      testimony.id testiID,
      testimony.history_id historyID,
      testimony.date_added, 
      testimony.rate,
      history.rental_date,
      history.return_date,
      testimony.testimony 
      FROM testimony JOIN history ON testimony.history_id = history.id`;
  console.log(order, 'here');
  db.query(sqlQuery + order + sort, (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: 'Data cannot be retrieved',
        err,
      });
    }
    if (result.length == 0) {
      return res.status(404).json({
        mgs: 'Data cannot be found',
      });
    }
    const testimonyResult = [];
    result.forEach((_element, index) => {
      testimonyResult[index] = result[index];
      const rentalDate = grabLocalYMD(testimonyResult[index].rental_date);
      const returnDate = grabLocalYMD(testimonyResult[index].return_date);
      const dateAdded = grabLocalYMD(testimonyResult[index].date_added);
      testimonyResult[index] = {
        ...testimonyResult[index],
        rental_date: rentalDate,
        return_date: returnDate,
        date_added: dateAdded,
      };
    });
    return res.status(200).json({
      msg: 'Testimony',
      testimonies: testimonyResult,
    });
  });
};

const addNewTestimony = (req, res) => {
  const {
    body: {historyId, rate, testimony},
  } = req;
  const date = grabLocalYMD(new Date());
  console.log(date);
  const queryCheckTestimony = `SELECT * FROM testimony where history_id = ?`;
  db.query(queryCheckTestimony, [mysql.raw(historyId)], (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: 'Problem occured',
        err,
      });
    }
    if (result.length !== 0) {
      return res.status(409).json({
        msg: 'Data already existed',
      });
    } else {
      const sqlQuery = `INSERT INTO 
        testimony (id, history_id, rate, testimony, date_added) 
          VALUES (0, "${historyId}", "${rate}", "${testimony}", "${date}")`;
      db.query(sqlQuery, (err, result) => {
        if (err) {
          return res.status(500).json({
            msg: 'Something went wrong',
            err,
          });
        }
        return res.status(201).json({
          msg: 'Data successfully submitted',
          result: {
            historyId,
            rate,
            testimony,
            id: result.insertId,
          },
        });
      });
    }
  });
};

module.exports = {addNewTestimony, getTestimony};
