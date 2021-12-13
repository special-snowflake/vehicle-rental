const mysql = require('mysql');
const db = require('../config/db');
const fs = require('fs');
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
  const {payload, file} = req;
  const id = payload.id;
  const {
    body: {firstName, lastName, bod, sex, email, phone, address},
  } = req;
  console.log('[db middleware user file]:', typeof file, file);
  // console.log('[db] user middle update photo:', photo);
  const sqlQuery = `SELECT first_name, 
  last_name, bod, sex, email, phone, address, 
  photo FROM users WHERE id = ?`;
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
    let bodyUpdate = [];
    bodyUpdate[0] = result[0];
    console.log('[db] unupdated :', bodyUpdate);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'first_name', firstName);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'last_name', lastName);
    bodyUpdate[0] = checkingPatchDate(bodyUpdate, 'bod', bod);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'sex', sex);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'email', email);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'phone', phone);
    bodyUpdate[0] = checkingPatchWithData(bodyUpdate, 'address', address);
    let photo = null;
    if (file !== undefined) {
      console.log('wyhy am i here');
      photo = file.filename;
    }
    if (photo !== null) {
      console.log('photo not null', photo);
      const oldPhoto = bodyUpdate[0].photo;
      fs.unlink(`../vehicle-rental/src/media/images/${oldPhoto}`, (err) => {
        if (err) {
          return resolve({
            staus: 200,
            result: {msg: 'Error occur while deleting photo.', err},
          });
        }
      });
      bodyUpdate[0] = {
        ...bodyUpdate[0],
        photo,
      };
    }
    console.log('[db] middleware bodyUpdate :', bodyUpdate);
    req.bodyUpdate = bodyUpdate[0];
    next();
  });
};

module.exports = {checkUsername, getDataUserForUpdate};
