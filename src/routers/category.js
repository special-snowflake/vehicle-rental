/* eslint-disable */
const express = require('express');
const mysql = require('mysql');

const categoryRouter = express.Router();
const db = require('../config/db');

categoryRouter.post(
  '/',
  (req, res, next) => {
    const {
      body: {category},
    } = req;
    const sqlQuery = `SELECT * FROM category WHERE category = ?`;
    db.query(sqlQuery, [category], (err, result) => {
      if (err)
        return res.status(500).json({
          msg: 'Something went wrong',
          err,
        });
      if (result === 0) {
        return res.status(409).json({
          msg: 'Same category already exist.',
        });
      } else {
        next();
      }
    });
  },
  (req, res) => {
    const {
      body: {category},
    } = req;
    const sqlQuery = `INSERT INTO category (category) VALUES (?)`;
    db.query(sqlQuery, [category], (err, result) => {
      if (err)
        return res.status(500).json({
          msg: 'Something went wrong while submitting category.',
          err,
        });
      return res.status(200).json({
        msg: 'New Category Added',
        category,
        id: result.insertId,
      });
    });
  }
);

categoryRouter.get('/', (req, res) => {
  const {query} = req;
  console.log(query.filter);
  const filter = query.filter == undefined ? '' : query.filter;
  const sqlQuery = `SELECT * FROM category ORDER BY category ?`;
  console.log(filter);
  db.query(sqlQuery, [mysql.raw(filter)], (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    if (result.length == 0) {
      return res.status(204).json({
        msg: 'Category is empty',
      });
    }
    return res.status(200).json({
      msg: 'Category',
      result,
    });
  });
});

categoryRouter.patch('/', (req, res) => {
  const sqlQuery = `UPDATE category SET category = ? where id = ?`;
  const params = [req.body.category, req.body.id];
  db.query(sqlQuery, params, (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something when wrong',
        err,
      });
    return res.status(200).json(result);
  });
});

module.exports = categoryRouter;
