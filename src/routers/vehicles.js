/* eslint-disable */
const express = require('express');
const mysql = require('mysql');

const vehiclesRouter = express.Router();
const db = require('../config/db');

vehiclesRouter.get('/', (req, res, _next) => {
  const {query} = req;
  let keyword = '%%';
  if (query.type) keyword = `%${query.type}%`;
  const sqlQuery = `SELECT * FROM vehicles WHERE type LIKE ?`;
  db.query(sqlQuery, [mysql.raw(keyword)], (err, result) => {
    if (err) {
      return res.status(500).json({msg: 'Error Found', err, keyword});
    }
    return res.status(200).json({
      result,
      keyword,
    });
  });
});

vehiclesRouter.post(
  '/',
  (req, res, next) => {
    const {
      body: {category},
    } = req;
    sqlQuery = `SELECT id FROM category WHERE category = ?`;
    console.log(sqlQuery);
    db.query(sqlQuery, [category], (err, result) => {
      if (err) {
        return res.status(500).json({
          msg: 'Something went wrong.',
          err,
        });
      }
      if (result.length == 0) {
        return res.status(404).json({
          msg: 'Category cannot be found!',
          err,
        });
      }
      req.body.categoryID = result[0].id;
      next();
    });
  },
  (req, res, next) => {
    const {
      body: {city},
    } = req;
    sqlQuery = `SELECT id FROM city WHERE city = ?`;
    db.query(sqlQuery, [city], (err, result) => {
      if (err) {
        return res.status(500).json({
          msg: 'Something went wrong.',
          err,
        });
      }
      if (result.length == 0) {
        return res.status(404).json({
          msg: 'City cannot be found!',
          err,
        });
      }
      req.body.cityID = result[0].id;
      next();
    });
  },
  (req, res) => {
    const {
      body: {brand, model, capacity, price, status, stock, cityID, categoryID},
    } = req;
    const prepare = [
      categoryID,
      cityID,
      brand,
      model,
      capacity,
      price,
      status,
      stock,
    ];
    console.log(prepare);
    const sqlQuery = `
    INSERT INTO vehicles 
    ( category_id, city_id, brand, model, capacity, price, status, stock) 
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?);`;
    db.query(sqlQuery, prepare, (err, result) => {
      if (err)
        return res.status(500).json({
          msg: 'Something went wrong',
          err,
        });
      return res.status(200).json(result);
    });
  }
);

module.exports = vehiclesRouter;
