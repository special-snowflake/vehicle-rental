const db = require('../config/db');

const modelHistory = require('../models/history');
const resHelper = require('../helpers/sendResponse');

const {
  checkingPatchWithData,
  checkingPatchDate,
} = require('../helpers/collection');

const checkInputHistory = (req, res, next) => {
  const {
    body: {vehicleId, unit},
  } = req;
  modelHistory
    .modelCheckInputHistory(vehicleId, unit)
    .then(({status, result}) => {
      if (status == 404) {
        return resHelper.success(res, status, {
          msg: 'Vehicle cannot be found!',
        });
      }
      if (status == 403) {
        return resHelper.success(res, status, {
          msg: `Vehicle isn't available for booking.`,
        });
      }
      req.body.vehicleId = result[0].id;
      req.body.price = result[0].price;
      next();
    })
    .catch((err) => {
      resHelper.error(res, 500, {err});
    });
};

const getUserId = (req, res, next) => {
  const {
    body: {userId},
  } = req;
  const sqlQuery = `SELECT id FROM users WHERE id = ?`;
  db.query(sqlQuery, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: 'Something went wrong.',
        err,
      });
    }
    if (result.length == 0) {
      return res.status(404).json({
        msg: 'User cannot be found!',
        err,
      });
    }
    req.body.userId = result[0].id;
    next();
  });
};

const getDataForUpdate = (req, res, next) => {
  const {
    body: {
      id,
      vehicleId,
      userId,
      rentalDate,
      returnDate,
      returnStatus,
      unit,
      totalPayment,
    },
  } = req;
  const sqlQuery = `SELECT * FROM history WHERE id = ?`;
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
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'vehicle_id', vehicleId);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'user_id', userId);
    bodyUpdate[0] = checkingPatchDate(bodyUpdate, 'rental_date', rentalDate);
    bodyUpdate[0] = checkingPatchDate(bodyUpdate, 'return_date', returnDate);
    bodyUpdate[0] = checkingPatchWithData(
      bodyUpdate,
      'return_status',
      returnStatus
    );
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'unit', unit);
    bodyUpdate[0] = checkingPatchWithData(
      bodyUpdate,
      'total_payment',
      totalPayment
    );
    req.bodyUpdate = bodyUpdate[0];
    next();
  });
};

const getDataForDelete = (req, res, next) => {
  const {
    body: {id},
  } = req;
  const sqlQuery = 'SELECT * FROM history WHERE id = ?';
  db.query(sqlQuery, [id], (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    if (result.length === 0)
      return res.status(404).json({
        msg: 'Id cannot be found',
      });
    req.body = result[0];
    next();
  });
};

module.exports = {
  checkInputHistory,
  getUserId,
  getDataForUpdate,
  getDataForDelete,
};
