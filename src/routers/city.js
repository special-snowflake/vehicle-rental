/* eslint-disable */
const express = require('express');
const mysql = require('mysql');

const cityRouter = express.Router();
const db = require('../config/db');

cityRouter.post(
  '/',
  (req, res, next) => {
    const {
      body: {city},
    } = req;
    const sqlQuery = `SELECT * FROM city WHERE city = ?`;
    db.query(sqlQuery, [city], (err, result) => {
      if (err)
        return res.status(500).json({
          msg: 'Something went wrong',
          err,
        });
      if (result === 0) {
        return res.status(409).json({
          msg: 'Same city already exist.',
        });
      } else {
        next();
      }
    });
  },
  (req, res) => {
    const {
      body: {city},
    } = req;
    const sqlQuery = `INSERT INTO city (city) VALUES (?)`;
    db.query(sqlQuery, [city], (err, result) => {
      if (err)
        return res.status(500).json({
          msg: 'Something went wrong while submitting city.',
          err,
        });
      return res.status(200).json({
        msg: 'New city Added',
        id: result.insertId,
        city,
      });
    });
  }
);

cityRouter.get('/', (req, res) => {
  const {query} = req;
  console.log(query.filter);
  const filter = query.filter == undefined ? '' : query.filter;
  const sqlQuery = `SELECT * FROM city ORDER BY city ?`;
  console.log(filter);
  db.query(sqlQuery, [mysql.raw(filter)], (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    if (result.length == 0) {
      return res.status(204).json({
        msg: 'city is empty',
      });
    }
    return res.status(200).json({
      msg: 'city',
      result,
    });
  });
});

cityRouter.patch('/', (req, res) => {
  const sqlQuery = `UPDATE city SET city = ? where id = ?`;
  const params = [req.body.city, req.body.id];
  console.log(params);
  db.query(sqlQuery, params, (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something when wrong',
        err,
      });
    return res.status(200).json(result);
  });
});

cityRouter.delete('/', (req, res) => {
  const sqlQuery = `DELETE FROM city WHERE id = ?`;
  const param = [req.body.id];
  console.log(param);
  db.query(sqlQuery, param, (err, result) => {
    if (err) return res.status(500).json({msg: 'Something went wrong', err});
    return res.status(200).json({
      msg: 'Delete city success',
      id: req.body.id,
    });
  });
});

module.exports = cityRouter;
