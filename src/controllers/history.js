const mysql = require('mysql');
const db = require('../config/db');

const {
  grabLocalYMD,
  calculateDays,
} = require('../helpers/collection');

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
    return res
      .status(422)
      .send('Return date must be bigger or the same as rental date.');
  const rentalDays = calculateDays(rental_date, return_date);
  const totalPayment = unit * rentalDays * price;
  const preapare = [
    vehicleId,
    userId,
    rental_date,
    return_date,
    return_status,
    unit,
    totalPayment,
  ];
  const sqlQuery = `INSERT INTO history 
    (vehicle_id, user_id, rental_date, return_date, return_status, unit, total_payment)
    VALUES
    (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sqlQuery, preapare, (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Error occure while adding history',
        err,
      });
    return res.status(200).json({
      id: result.insertId,
      vehicleId,
      userId,
      rental_date,
      return_date,
      return_status,
      unit,
      totalPayment,
    });
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
  const sqlQuery = `SELECT 
    h.id, v.brand, v.model, 
    h.rental_date, 
    h.return_date, 
    h.return_status,
    h.total_payment
    FROM history h 
    JOIN vehicles v 
    ON h.vehicle_id = v.id 
    ?
    ?`;
  db.query(
    sqlQuery,
    [mysql.raw(whereId), mysql.raw(orderBy)],
    (err, result) => {
      if (err)
        return res.status(500).json({
          msg: 'Data cannot be retrieved',
          err,
        });
      if (result.length == 0)
        return res.status(200).json({
          msg: `There's no history to show`,
        });
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
      return res.status(200).json({history});
    }
  );
};

const updateHistory = (req, res) => {
  const {bodyUpdate} = req;
  const params = [
    (vehicle_id = bodyUpdate.vehicle_id),
    (user_id = bodyUpdate.user_id),
    (rental_date = bodyUpdate.rental_date),
    (return_date = bodyUpdate.return_date),
    (return_status = bodyUpdate.return_status),
    (unit = bodyUpdate.unit),
    (total_payment = bodyUpdate.total_payment),
    (id = bodyUpdate.id),
  ];
  const updateQuery = `UPDATE history SET
    vehicle_id = ?,
    user_id = ?,
    rental_date = ?,
    return_date = ?,
    return_status = ?,
    unit = ?,
    total_payment = ?
    WHERE id = ?;`;
  db.query(updateQuery, params, (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    return res.status(200).json({
      msg: 'Data successfully updated.',
      data: bodyUpdate,
    });
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
  db.query(sqlQuery, [id], (err, result) => {
    if (err.code == 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        msg: `Cannot delete data that's being used.`,
        err: err.code,
      });
    }
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    return res.status(200).json({
      msg: 'History deleted',
      id,
      vehicle_id,
      user_id,
      rental_date: grabLocalYMD(rental_date),
      return_date: grabLocalYMD(return_date),
      return_status,
      unit,
      total_payment,
    });
  });
};

module.exports = {addHistory, getHistory, updateHistory, deleteHistory};
