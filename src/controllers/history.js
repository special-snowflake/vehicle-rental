const mysql = require('mysql');
const db = require('../config/db');

const modelHistory = require('../models/history');
const resHelper = require('../helpers/sendResponse');

const {grabLocalYMD, calculateDays} = require('../helpers/collection');

const addHistory = (req, res) => {
  const {
    body: {
      vehicleId,
      unit,
      price,
      userId,
      rental_date,
      return_date,
      return_status,
    },
  } = req;
  if (rental_date > return_date)
    return resHelper.error(res, 422, {
      errMSg: `Return date must be bigger or the same as rental date.`,
    });
  const rentalDays = calculateDays(rental_date, return_date);
  const totalPayment = unit * rentalDays * price;
  const prepare = [
    vehicleId,
    userId,
    rental_date,
    return_date,
    return_status,
    unit,
    totalPayment,
  ];
  modelHistory
    .modelAddHistory(prepare)
    .then(({status, result}) => {
      const data = {
        id: result.insertId,
        vehicleId,
        userId,
        rental_date,
        return_date,
        return_status,
        unit,
        totalPayment,
      };
      resHelper.success(res, status, {
        msg: 'New History Added',
        data,
      });
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

const getHistory = (req, res) => {
  const {
    query: {order, sort, userId},
  } = req;
  let orderBy = ``;
  let whereId = ``;
  if (typeof userId !== 'undefined' && userId !== '') {
    whereId = ` WHERE user_id = ${userId}`;
  }
  if (typeof order !== 'undefined' && order !== '') {
    orderBy = ` ORDER BY ${order}`;
    if (typeof sort !== 'undefined') {
      if (sort.toLocaleLowerCase() === 'desc') {
        orderBy += ` DESC`;
      }
    }
  }
  const prepare = [mysql.raw(whereId), mysql.raw(orderBy)];
  modelHistory
    .modelGetHistory(prepare)
    .then(({status, result}) => {
      if (result.length == 0) {
        return resHelper.success(res, status, {
          msg: `There's not a single history found.`,
        });
      }
      const history = [];
      result.forEach((_element, index) => {
        history[index] = result[index];
        const rentalDate = grabLocalYMD(history[index].rental_date);
        const returnDate = grabLocalYMD(history[index].return_date);
        history[index] = {
          ...history[index],
          rental_date: rentalDate,
          return_date: returnDate,
        };
      });
      return resHelper.success(res, status, {
        msg: 'History:',
        meta: {
          totalData: result.length,
        },
        data: history,
      });
    })
    .catch((err) => {
      resHelper.error(res, 500, {
        errMsg: 'Data history cannot be retrieved.',
        err,
      });
    });
};

const updateHistory = (req, res) => {
  const {bodyUpdate} = req;
  const prepare = [
    (vehicle_id = bodyUpdate.vehicle_id),
    (user_id = bodyUpdate.user_id),
    (rental_date = bodyUpdate.rental_date),
    (return_date = bodyUpdate.return_date),
    (return_status = bodyUpdate.return_status),
    (unit = bodyUpdate.unit),
    (total_payment = bodyUpdate.total_payment),
    (id = bodyUpdate.id),
  ];
  modelHistory
    .modelUpdateHistory(prepare)
    .then(({status}) => {
      resHelper.success(res, status, {
        msg: 'History is updated.',
        data: bodyUpdate,
      });
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

const deleteHistory = (req, res) => {
  const {
    body: {
      id,
      vehicle_id,
      user_id,
      rental_date,
      return_date,
      return_status,
      unit,
      total_payment,
    },
  } = req;
  const sqlQuery = 'DELETE FROM history WHERE id = ?';
  db.query(sqlQuery, [id], (err) => {
    if (err) {
      if (err.code == 'ER_ROW_IS_REFERENCED_2') {
        return resHelper.error(res, 409, {
          errMsg: `Cannot delete data that's being used.`,
        });
      }
      return resHelper.error(res, 500, {
        errMsg: 'Something went wrong.',
        err,
      });
    }
    const data = {
      id,
      vehicle_id,
      user_id,
      rental_date: grabLocalYMD(rental_date),
      return_date: grabLocalYMD(return_date),
      return_status,
      unit,
      total_payment,
    };
    return res.status(200).json({
      msg: 'History deleted.',
      data,
    });
  });
};

module.exports = {addHistory, getHistory, updateHistory, deleteHistory};
