const db = require('../config/db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const register = (body) => {
  return new Promise((resolve, reject) => {
    console.log(body);
    let password = body.password;
    const username = body.username;
    const roles = body.roles;
    const sqlInsertUser = `INSERT INTO users SET ?;`;
    const sqlInsertUserAccess = `INSERT INTO user_access 
    (user_id, username, password, roles) 
    VALUES (?, ?, ?, ?);`;
    bcrypt
      .hash(body.password, 10)
      .then((hashedPassword) => {
        password = hashedPassword;
        const bodyUpdate = {
          ...body,
        };
        delete bodyUpdate.password;
        delete bodyUpdate.username;
        delete bodyUpdate.roles;
        console.log(bodyUpdate);
        db.query(sqlInsertUser, [bodyUpdate], (err, result) => {
          if (err) return reject(err);
          const prepare = [result.insertId, username, password, roles];
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
    const sqlGetPassword = `SELECT * FROM user_access ua 
    JOIN users u ON u.id = ua.user_id
    WHERE ua.username = ? OR u.email = ?`;
    db.query(sqlGetPassword, [user, user], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        console.log(result);
        return resolve({
          status: 401,
          result: {
            msg: 'Login Failed. Check your email/username and password.',
          },
        });
      }
      const passwordHased = result[0].password;
      bcrypt.compare(password, passwordHased, (err, res) => {
        if (err) return reject(err);
        if (!res) {
          return reject(err);
        }
        const payload = {
          id: result[0].user_id,
          email: result[0].email,
          username: result[0].username,
          name: result[0].first_name + ' ' + result[0].last_name,
          roles: result[0].roles,
        };
        const jwtOptions = {
          expiresIn: '15m',
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

const logout = (token) => {
  return new Promise((resolve, reject) => {
    const sqlAddBlacklist = `INSERT INTO blacklist_token (token) values(?)`;
    db.query(sqlAddBlacklist, [token], (err) => {
      if (err) return reject(err);
      resolve({status: 200, result: {msg: 'Logout success.'}});
    });
  });
};

module.exports = {register, login, logout};
