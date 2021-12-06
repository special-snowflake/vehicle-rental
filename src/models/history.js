// const mysql = require('mysql');
const db = require('../config/db');

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

module.exports = {
  modelCheckInputHistory,
  modelGetUserId,
  modelGetDataForUpdate,
  modelGetDataForDelete,
};
