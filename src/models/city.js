const mysql = require('mysql');
const db = require('../config/db');

const modelAddcity = (city) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `INSERT INTO city (city) VALUES (?)`;
    db.query(sqlQuery, [city], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve({status: 200, result});
    });
  });
};

const modelGetcity = (query) => {
  return new Promise((resolve, reject) => {
    const filter = query;
    const sqlQuery = `SELECT * FROM city ORDER BY city ?`;
    db.query(sqlQuery, [mysql.raw(filter)], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({status: 204, result});
      }
      resolve({status: 200, result});
    });
  });
};

const modelUpdatecity = (city, id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `UPDATE city SET city = ? where id = ?`;
    const params = [city, id];
    db.query(sqlQuery, params, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({status: 200, result});
    });
  });
};

const modelDeletecity = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `DELETE FROM city WHERE id = ?`;
    const param = [id];
    db.query(sqlQuery, param, (err, result) => {
      if (err) return reject(err);
      if (result.affectedRows == 0) {
        return resolve({status: 209, result});
      }
      resolve({status: 200, result});
    });
  });
};

const modelcityAddVerivication = (city) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM city WHERE city = ?`;
    const params = [city];
    db.query(sqlQuery, params, (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length !== 0) {
        return resolve({status: 409, result});
      }
      resolve({status: 200, result});
    });
  });
};

module.exports = {
  modelGetcity,
  modelUpdatecity,
  modelAddcity,
  modelDeletecity,
  modelcityAddVerivication,
};
