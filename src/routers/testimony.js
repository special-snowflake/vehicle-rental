/* eslint-disable operator-linebreak */
const express = require('express');
const mysql = require('mysql');

const {grabLocalYMD} = require('../helpers/collection');

const testimonyRouter = express.Router();
const db = require('../config/db');

testimonyRouter.post('/', (req, res, _next) => {
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
});

testimonyRouter.get('/', (req, res, _next) => {
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
    return res.status(200).json({
      msg: 'Testimony',
      result,
    });
  });
});

module.exports = testimonyRouter;
