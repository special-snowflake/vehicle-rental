const {reject} = require('bcrypt/promises');
const mysql = require('mysql');
const db = require('../config/db');
const {grabLocalYMD} = require('../helpers/collection');

const addNewTestimony = (historyId, rate, testimony, date) => {
  return new Promise((resolve, reject) => {
    const queryCheckTestimony = `SELECT * FROM testimony where history_id = ?`;
    db.query(queryCheckTestimony, [mysql.raw(historyId)], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length !== 0) {
        return resolve({
          status: 409,
          result: {msg: 'Testimony already existed.'},
        });
      } else {
        const prepare = [historyId, rate, testimony, date];
        const sqlQuery = `INSERT INTO 
          testimony ( history_id, rate, testimony, date_add) 
            VALUES (?, ?, ?, ?)`;
        db.query(sqlQuery, prepare, (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve({
            status: 200,
            result: {
              msg: 'New Testimony Added.',
              data: {
                historyId,
                rate,
                testimony,
                id: result.insertId,
              },
            },
          });
        });
      }
    });
  });
};

const getTestimony = (req) => {
  return new Promise((resolve, reject) => {
    let order = '';
    if (req.query.orderBy) {
      const orderBy = req.query.orderBy;
      console.log(orderBy);
      order =
        orderBy == 'date'
          ? ' ORDER BY testimony.date_add '
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
            testimony.date_add, 
            testimony.rate,
            history.rental_date,
            history.return_date,
            testimony.testimony 
            FROM testimony JOIN history ON testimony.history_id = history.id`;
    console.log(order, 'here');
    db.query(sqlQuery + order + sort, (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({status: 404, result: {msg: 'Data cannot be found.'}});
      }
      const testimonyResult = [];
      result.forEach((_element, index) => {
        testimonyResult[index] = result[index];
        const rentalDate = grabLocalYMD(testimonyResult[index].rental_date);
        const returnDate = grabLocalYMD(testimonyResult[index].return_date);
        const dateAdded = grabLocalYMD(testimonyResult[index].date_add);
        testimonyResult[index] = {
          ...testimonyResult[index],
          rental_date: rentalDate,
          return_date: returnDate,
          date_add: dateAdded,
        };
      });
      return resolve({
        status: 200,
        result: {
          msg: 'List of Testimony.',
          meta: {totalData: testimonyResult.length},
          data: testimonyResult,
        },
      });
    });
  });
};

const deleteTestimony = (id) => {
  return new Promise((resolve, reject) => {
    const sqlGetTestimony = `SELECT * FROM testimony WHERE id = ?`;
    const sqlDelete = `DELETE FROM testimony WHERE id = ?`;
    db.query(sqlGetTestimony, [id], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({
          status: 404,
          result: {errMsg: 'Testimony cannot be found.'},
        });
      }
      const data = result;
      console.log('[db] testi dlt:', data);
      db.query(sqlDelete, [id], (err, _result) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          status: 200,
          result: {msg: 'Testimony deleted.', data},
        });
      });
    });
  });
};

module.exports = {addNewTestimony, getTestimony, deleteTestimony};
