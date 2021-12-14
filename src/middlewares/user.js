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
      console.log('[db] inside file undefined');
      photo = file.filename;
    }
    if (photo !== null) {
      console.log('[db] mid use new photo name', photo);
      const oldPhoto = bodyUpdate[0].photo;
      console.log('old photo', oldPhoto);
      fs.unlink(`../vehicle-rental/media/images/${oldPhoto}`, (err) => {
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

const validateRegister = (req, res, next) => {
  const {body} = req;
  const registerBody = [
    'first_name',
    'last_name',
    'bod',
    'sex',
    'email',
    'address',
    'join_date',
    'username',
    'password',
    'roles',
  ];
  const bodyProperty = Object.keys(body);
  console.log(req);
  const isBodyValid =
    registerBody.filter((property) => !bodyProperty.includes(property))
      .length == 0
      ? true
      : false;
  console.log(isBodyValid);
  if (!isBodyValid) return res.status(400).json({msg: 'Invalid Body'});
  next();
};

module.exports = {checkUsername, getDataUserForUpdate, validateRegister};
