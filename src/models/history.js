// const mysql = require('mysql');
const db = require('../config/db');
const modelHelp = require('../helpers/modelsHelper');

const modelCheckInputHistory = (id, unit) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT id, stock, price, status 
        FROM vehicles WHERE id = ?`;
    db.query(sqlQuery, [id], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({status: 404, result});
      }
      if (result[0].stock < unit) {
        return resolve({status: 403, result});
      }
      if (result[0].status !== 'Available') {
        return resolve({status: 403, result});
      }
      resolve({status: 200, result});
    });
  });
};

const modelGetUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT id FROM users WHERE id = ?`;
    db.query(sqlQuery, [userId], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({status: 404, result});
      }
      resolve({status: 200, result});
    });
  });
};

const modelGetDataForUpdate = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM history WHERE id = ?`;
    db.query(sqlQuery, [id], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({status: 409, result});
      }
      resolve({status: 200, result});
    });
  });
};

const modelGetDataForDelete = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = 'SELECT * FROM history WHERE id = ?';
    db.query(sqlQuery, [id], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({status: 404, result});
      }
      resolve({status: 200, result});
    });
  });
};

const modelAddHistory = (prepare) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `INSERT INTO history 
    (vehicle_id, 
    user_id, 
    rental_date, 
    return_date, 
    return_status, 
    unit, 
    total_payment)
    VALUES
    (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sqlQuery, prepare, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({status: 200, result});
    });
  });
};

const modelGetHistory = (prepare) => {
  return new Promise((resolve, reject) => {
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
    db.query(sqlQuery, prepare, (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

const modelUpdateHistory = (prepare) => {
  return new Promise((resolve, reject) => {
    const updateQuery = `UPDATE history SET
    vehicle_id = ?,
    user_id = ?,
    rental_date = ?,
    return_date = ?,
    return_status = ?,
    unit = ?,
    total_payment = ?
    WHERE id = ?;`;
    db.query(updateQuery, prepare, (err, result) => {
      if (err) {
        return reject(err);
        res.status(500).json({
          msg: 'Something went wrong',
          err,
        });
      }
      return resolve({status: 200, result});
      res.status(200).json({
        msg: 'Data successfully updated.',
        data: bodyUpdate,
      });
    });
  });
};

module.exports = {
  modelCheckInputHistory,
  modelGetUserId,
  modelGetDataForUpdate,
  modelGetDataForDelete,
  modelAddHistory,
  modelGetHistory,
  modelUpdateHistory,
};
