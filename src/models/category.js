const mysql = require('mysql');
const db = require('../config/db');

const modelAddCategory = (category) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `INSERT INTO category (category) VALUES (?)`;
    db.query(sqlQuery, [category], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve({status: 200, result});
    });
  });
};

const modelGetCategory = (query) => {
  return new Promise((resolve, reject) => {
    const filter = query;
    const sqlQuery = `SELECT * FROM category ORDER BY category ?`;
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

const modelUpdateCategory = (category, id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `UPDATE category SET category = ? where id = ?`;
    const params = [category, id];
    db.query(sqlQuery, params, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({status: 200, result});
    });
  });
};

const modelDeleteCategory = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `DELETE FROM category WHERE id = ?`;
    db.query(sqlQuery, [id], (err, result) => {
      if (err) return reject(err);
      resolve({status: 200, result});
    });
  });
};

const modelCategoryAddVerivication = (category) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM category WHERE category = ?`;
    const params = [category];
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
  modelGetCategory,
  modelUpdateCategory,
  modelAddCategory,
  modelDeleteCategory,
  modelCategoryAddVerivication,
};
