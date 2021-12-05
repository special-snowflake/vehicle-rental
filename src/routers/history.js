/* eslint-disable */
const express = require('express');
const mysql = require('mysql');

const historyRouter = express.Router();
const db = require('../config/db');

const {grabLocalYMD, calculateDays} = require('../helpers/collection');

historyRouter.post(
  '/',
  (req, res, next) => {
    const {
      body: {vehicleId, unit},
    } = req;
    const sqlQuery = `SELECT id, stock, price, status 
    FROM vehicles WHERE id = ?`;
    db.query(sqlQuery, [vehicleId], (err, result) => {
      if (err) {
        return res.status(500).json({
          msg: 'Something went wrong.',
          err,
        });
      }
      if (result.length == 0) {
        return res.status(404).json({
          msg: 'Vehicle cannot be found!',
        });
      }
      if (result[0].stock < unit)
        return res.status(500).json({
          msg: `Unit shouldn't be bigger than stock`,
          stock: result.stock,
        });
      if (result[0].status !== 'Available')
        return res.status(500).json({
          msg: `Vehicle isn't available for booking.`,
        });
      req.body.vehicleId = result[0].id;
      req.body.price = result[0].price;
      next();
    });
  },
  (req, res, next) => {
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
  },
  (req, res) => {
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
  }
);

historyRouter.get('/', (req, res) => {
  const {
    query: {order, sort},
  } = req;
  let orderBy = ``;
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
  ON h.vehicle_id = v.id ?`;
  db.query(sqlQuery, [mysql.raw(orderBy)], (err, result) => {
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
  });
});

historyRouter.patch('/', (req, res) => {
  const {
    body: {id, vehicleId, userId, rentalDate, returnDate, returnStatus, unit},
  } = req;
});

historyRouter.delete(
  '/',
  (req, res, next) => {
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
      console.log(req.body);
      next();
    });
  },
  (req, res) => {
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
  }
);
module.exports = historyRouter;
