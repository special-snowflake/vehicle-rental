const db = require('../config/db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const register = (body) => {
  return new Promise((resolve, reject) => {
    const firstName = body.name;
    const email = body.email;
    const password = body.password;
    const sqlCheckEmail = `SELECT email from users where email = ?`;
    const sqlInserUser = `INSERT INTO users (full_name, email)
    VALUES (?, ?)`;
    const sqlInsertUserAccess = `INSERT INTO user_access 
    (user_id,password,roles) VALUES (?,?,?)`;
    db.query(sqlCheckEmail, [email], (err, result) => {
      if (err) return reject(err);
      if (result.length !== 0) {
        return resolve({
          status: 401,
          result: {errMsg: 'Email is already registered'},
        });
      }
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          console.log('[db]auth mdl hashpass is ok');
          const prepareUsers = [firstName, email];
          db.query(sqlInserUser, prepareUsers, (err, result) => {
            if (err) return reject(err);
            console.log('[db]auth insert users is ok');
            const userId = result.insertId;
            const preparUserAccess = [
              result.insertId,
              hashedPassword,
              'customer',
            ];
            db.query(sqlInsertUserAccess, preparUserAccess, (err, result) => {
              console.log('[db]auth insert ua is ok');
              if (err) return reject(err);
              return resolve({
                status: 200,
                result: {msg: 'Register success.', data: {userId, email}},
              });
            });
          });
        })
        .catch((err) => {
          console.log('[db] auth mdl bcrypt error');
          return reject(err);
        });
    });
  });
};

const login = (body) => {
  return new Promise((resolve, reject) => {
    const {user, password} = body;
    const sqlGetPassword = `SELECT u.id, u.email, u.full_name, 
    ua.username, ua.password, ua.roles, u.photo
    FROM user_access ua 
    JOIN users u ON u.id = ua.user_id
    WHERE ua.username = ? OR u.email = ?`;
    console.log(user);
    db.query(sqlGetPassword, [user, user], (err, result) => {
      const data = result[0];
      console.log(data);
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({
          status: 401,
          result: {
            errMsg: 'Login Failed. Check your email/password.',
          },
        });
      }
      const passwordHased = result[0].password;
      console.log('db hash pass', passwordHased, password);
      bcrypt.compare(password, passwordHased, (err, result) => {
        if (err) return reject(err);
        if (result === false) {
          const error = new Error('Wrong user/password');
          return reject(error.message);
        }
        const payload = {
          id: data.id,
          email: data.email,
          username: data.username,
          name: data.full_name,
          photo: data.photo,
          roles: data.roles,
        };

        console.log(payload);
        const jwtOptions = {
          expiresIn: '2d',
          issuer: process.env.ISSUER,
        };
        jwt.sign(payload, process.env.SECRET_KEY, jwtOptions, (err, token) => {
          if (err) reject(err);
          console.log('login success');
          const data = {
            token,
            id: payload.id,
            roles: payload.roles,
            photo: payload.photo,
          };
          // console.table(data);
          console.log();
          resolve({
            status: 200,
            result: {msg: 'Login Success.', data},
          });
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
