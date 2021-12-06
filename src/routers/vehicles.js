const express = require('express');
const mysql = require('mysql');

const vehiclesRouter = express.Router();
const db = require('../config/db');

const {checkingPatchWithData} = require('../helpers/collection');

vehiclesRouter.get('/', (req, res, _next) => {
  const {query} = req;
  let keyword = '%%';
  if (query.type) keyword = `%${query.category}%`;
  const sqlQuery = `SELECT * FROM vehicles WHERE category_id in 
  (SELECT id FROM category WHERE category LIKE "?" )`;
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
    const sqlQuery = `SELECT id FROM category WHERE category_id = ?`;
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
    const sqlQuery = `SELECT id FROM city WHERE city = ?`;
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
      body: {
        brand,
        model,
        capacity,
        price,
        status,
        stock,
        cityID,
        categoryID,
        category,
        city,
      },
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
      return res.status(200).json({
        msg: 'New Item is Added to Vehicles',
        category,
        city,
        brand,
        model,
        capacity,
        price,
        status,
        stock,
      });
    });
  }
);

vehiclesRouter.patch(
  '/',
  (req, res, next) => {
    const {
      body: {
        id,
        categoryId,
        cityId,
        brand,
        model,
        capacity,
        price,
        status,
        stock,
      },
    } = req;
    const sqlQuery = `SELECT * FROM vehicles WHERE id = ?`;
    db.query(sqlQuery, [id], (err, result) => {
      if (err)
        return res.status(500).json({
          msg: 'Something went wrong',
          err,
        });
      if (result.length === 0)
        return res.status(409).json({
          msg: 'Id is unidentified.',
        });
      let bodyUpdate = [];
      bodyUpdate[0] = result[0];
      bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'city_id', cityId);
      bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'brand', brand);
      bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'model', model);
      bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'capacity', capacity);
      bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'price', price);
      bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'status', status);
      bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'stock', stock);
      req.bodyUpdate = bodyUpdate[0];
      next();
    });
  },
  (req, res) => {
    const {
      bodyUpdate: {
        id,
        category_id,
        city_id,
        brand,
        model,
        capacity,
        price,
        status,
        stock,
      },
    } = req;
    const params = [
      category_id,
      city_id,
      brand,
      model,
      capacity,
      price,
      status,
      stock,
      id,
    ];
    const sqlQuery = `UPDATE vehicles SET 
    category_id = ?,
    city_id = ?,
    brand = ?,
    model = ?,
    capacity = ?,
    price = ?,
    status = ?,
    stock = ?
    WHERE id = ?;`;
    db.query(sqlQuery, params, (err, result) => {
      if (err)
        return res.status(500).json({
          msg: 'Something went wrong.',
          err,
        });
      return res.status(200).json({
        msg: 'Data successfully updated.',
        newData: req.bodyUpdate,
      });
    });
  }
);

module.exports = vehiclesRouter;
