const db = require('../config/db');
// const mysql = require('mysql');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const register = (body) => {
  return new Promise((resolve, reject) => {
    let password = body.password;
    const username = body.username;
    const sqlInsertUser = `INSERT INTO users SET ?;`;
    const sqlInsertUserAccess = `INSERT INTO user_access 
    (user_id, username, password) 
    VALUES (?, ?, ?);`;
    bcrypt
      .hash(body.password, 10)
      .then((hashedPassword) => {
        password = hashedPassword;
        console.log(password);
        const bodyUpdate = {
          ...body,
        };
        delete bodyUpdate.password;
        delete bodyUpdate.username;
        db.query(sqlInsertUser, [bodyUpdate], (err, result) => {
          const prepare = [result.insertId, username, password];
          if (err) return reject(err);
          db.query(sqlInsertUserAccess, prepare, (err, result) => {
            if (err) return reject(err);
            resolve({status: 201, result});
          });
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {register};
