const mysql = require('mysql');
const db = require('../config/db');

const {checkingPatchWithData} = require('../helpers/collection');

const checkInputCategory = (req, res, next) => {
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
};

const checkInputCity = (req, res, next) => {
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
};
const getDataForUpdate = (req, res, next) => {
  const {
    body: {id, cityId, brand, model, capacity, price, status, stock},
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
};
module.exports = {checkInputCategory, checkInputCity, getDataForUpdate};
