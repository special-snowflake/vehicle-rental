const mysql = require('mysql');
const db = require('../config/db');

const searchUserByName = (name) => {
  console.log(name);
  return new Promise((resolve, reject) => {
    let keyword = `%%`;
    if (typeof name !== 'undefined' && name !== '') {
      keyword = `%${name}%`;
      console.log(keyword);
    }
    const mysqlQuery = `SELECT users.id, users.first_name, users.last_name, 
    users.sex, users.email, users.phone, users.address, 
    users.join_date, u.username FROM users 
    JOIN user_access u on users.id = u.user_id
    WHERE first_name LIKE '?' or last_name LIKE '?'`;
    db.query(
      mysqlQuery,
      [mysql.raw(keyword), mysql.raw(keyword)],
      (err, result) => {
        if (err) return reject(err);
        resolve({status: 200, result});
      }
    );
  });
};

const insertUserAccess = (params) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `INSERT INTO user_access 
    (user_id, username, password)
    VALUES (?, ?, ?);`;
    db.query(sqlQuery, params, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve({status: 200, result});
    });
  });
};

const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQueryUA = `
    DELETE FROM user_access WHERE user_id = ?`;
    const sqlQueryUsers = `DELETE FROM users WHERE id = ?`;
    db.query(sqlQueryUA, [id], (err, result) => {
      if (err) return reject(err);
      db.query(sqlQueryUsers, [id], (err, result) => {
        if (err) return reject(err);
        resolve({status: 200, result});
      });
    });
  });
};
module.exports = {searchUserByName, insertUserAccess, deleteUser};
