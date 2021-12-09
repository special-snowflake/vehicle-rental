const mysql = require('mysql');
const db = require('../config/db');

const {
  checkingPatchWithData,
  checkingPatchDate,
} = require('../helpers/collection');

const checkUsername = (req, res, next) => {
  const {
    body: {username},
  } = req;
  const sqlCheckUserAccess = `SELECT username FROM user_access 
  WHERE username = '?'`;
  db.query(sqlCheckUserAccess, [mysql.raw(username)], (err, result) => {
    if (err) {
      return res.status(200).json({
        msg: 'Something went wrong',
        err,
      });
    }
    if (result.length !== 0) {
      return res.status(409).json({
        msg: 'Username sudah digunakan. Masukkan username lain.',
      });
    } else {
      return next();
    }
  });
};

const getDataUserForUpdate = (req, res, next) => {
  const {
    body: {id, firstName, lastName, birthDate, sex, email, phone, address},
  } = req;
  const sqlQuery = `SELECT * FROM users WHERE id = ?`;
  db.query(sqlQuery, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    }
    if (result.length === 0) {
      return res.status(409).json({
        msg: 'Id is unidentified.',
      });
    }
    const bodyUpdate = [];
    bodyUpdate[0] = result[0];
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'first_name', firstName);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'last_name', lastName);
    bodyUpdate[0] = checkingPatchDate(bodyUpdate, 'birth_date', birthDate);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'sex', sex);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'email', email);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'phone', phone);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'address', address);
    console.log(bodyUpdate);
    req.bodyUpdate = bodyUpdate[0];
    next();
  });
};

module.exports = {checkUsername, getDataUserForUpdate};
