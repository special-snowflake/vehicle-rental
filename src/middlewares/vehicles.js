const db = require('../config/db');

const vehiclesModel = require('../models/vehicles');
const resHelper = require('../helpers/sendResponse');
const {checkingPatchWithData} = require('../helpers/collection');

const checkInputCategory = (req, res, next) => {
  const {
    body: {category},
  } = req;
  vehiclesModel
    .checkInputCategory(category)
    .then(({status, result}) => {
      if (result.length == 0) {
        return resHelper.success(res, status, {msg: 'Category is invalid'});
      }
      req.body.categoryID = result[0].id;
      next();
    })
    .catch((err) => {
      return resHelper.error(res, 500, {msg: 'Something went wrong.', err});
    });
};

const checkInputCity = (req, res, next) => {
  const {
    body: {city},
  } = req;
  vehiclesModel
    .checkInputCity(city)
    .then(({status, result}) => {
      if (result.length == 0) {
        return resHelper.success(res, status, {msg: 'Category is invalid'});
      }
      req.body.cityID = result[0].id;
      next();
    })
    .catch((err) => {
      return resHelper.error(res, 500, {msg: 'Something went wrong.', err});
    });
};

const getDataForUpdate = (req, res, next) => {
  const {
    body: {id, cityId, brand, model, capacity, price, status, stock},
  } = req;
  const sqlQuery = `SELECT * FROM vehicles WHERE id = ?`;
  db.query(sqlQuery, [id], (err, result) => {
    if (err) {
      return resHelper.error(res, 500, {msg: 'Something went wrong.', err});
    }
    if (result.length === 0) {
      return resHelper.success(res, status, {msg: 'Id is unidentified.'});
    }
    const bodyUpdate = [];
    bodyUpdate[0] = result[0];
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'city_id', cityId);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'brand', brand);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'model', model);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'capacity', capacity);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'price', price);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'status', status);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'stock', stock);
    req.bodyUpdate = bodyUpdate[0];
    console.log('middle upd veh');
    next();
  });
};

const getDataForDelete = (req, res, next) => {
  const {
    body: {id},
  } = req;
  const sqlQuery = `SELECT * FROM history where vehicle_id = ?`;
  db.query(sqlQuery, [id], (err, result) => {
    if (err) {
      return res.status(500).json({msg: 'Something went wrong.', err});
    }
    if (result.length !== 0) {
      return res
        .status(200)
        .json({msg: 'Cannot delete vehicle, data is being used in history.'});
    }
    next();
  });
};
module.exports = {
  checkInputCategory,
  checkInputCity,
  getDataForUpdate,
  getDataForDelete,
};
