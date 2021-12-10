const db = require('../config/db');

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
          if (err) return reject(err);
          const prepare = [result.insertId, username, password];
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

const login = (body) => {
  return new Promise((resolve, reject) => {
    const {user, password} = body;
    const sqlLogin = `SELECT * FROM user_access ua 
    JOIN users u ON u.id = ua.user_id
    WHERE ua.password = ? AND 
    (ua.username = ? OR u.email = ?;
    `;
    const sqlGetPassword = `SELECT * FROM user_access ua 
    JOIN users u ON u.id = ua.user_id
    WHERE ua.username = ? OR u.email = ?`;
    db.query(sqlGetPassword, [user, user], (err, result) => {
      if (err) {
        return reject(err);
      }
      const passwordHased = result[0].password;
      const payload = {
        id: result[0].id,
        email: result[0].email,
        name: result[0].first_name + ' ' + result[0].last_name,
      };
      bcrypt.compare(password, passwordHased, (err, res) => {
        if (err) return reject(err);
        if (!res) {
          return reject(err);
        }
        const jwtOptions = {
          expiresIn: '1m',
          issuer: process.env.ISSUER,
        };
        jwt.sign(payload, process.env.SECRET_KEY, jwtOptions, (err, token) => {
          if (err) reject(err);
          resolve({status: 200, result: {token}});
        });
      });
    });
  });
};
module.exports = {register, login};
