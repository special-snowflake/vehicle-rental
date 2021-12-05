const express = require('express');
const mysql = require('mysql');

const {grabLocalYMD} = require('../helpers/collection');

const userRouter = express.Router();
const db = require('../config/db');

userRouter.post(
  '/',
  (req, res, next) => {
    const {
      body: {username},
    } = req;
    const sqlCheckUserAccess = `SELECT username FROM user_access WHERE username = '?'`;
    db.query(sqlCheckUserAccess, [mysql.raw(username)], (err, result) => {
      if (err)
        return res.status(200).json({
          msg: 'Something went wrong',
          err,
        });
      if (result.length !== 0) {
        return res.status(409).json({
          msg: 'Username sudah digunakan. Masukkan username lain.',
        });
      } else {
        return next();
      }
    });
  },
  (req, _res, next) => {
    const {
      body: {
        firstName,
        lastName,
        birthDate,
        sex,
        email,
        phone,
        address,
        joinDate,
      },
    } = req;
    const sql = `INSERT INTO users (
    id, 
    first_name, 
    last_name, 
    birth_date, 
    sex,
    email,
    phone,
    address,
    join_date) 
    VALUES (
    0, 
    '${firstName}',
    '${lastName}',
    '${birthDate}',
    '${sex}',
    '${email}',
    '${phone}',
    '${address}',
    '${joinDate}'); `;
    db.query(sql, (err, result) => {
      if (err)
        return result.status(500).json({msg: 'Something went wrong', err});
      req.inputResult = result;
      return next();
    });
  },
  (req, res) => {
    const id = req.inputResult.insertId;
    const {
      body: {username, password},
    } = req;
    console.log(id + ' im here ' + username, password);
    const sqlQuery = `INSERT INTO user_access 
    (user_id, username, password)
    VALUES (?, ?, ?);`;
    db.query(sqlQuery, [id, username, password], (err, result) => {
      if (err)
        return res
          .status(500)
          .json({msg: 'Unable to insert usarname and password', err});
      return res
        .status(200)
        .json({msg: 'A New User Successfully Added', result});
    });
  }
);

userRouter.get('/:username', (req, res) => {
  const {params} = req;
  const username = params.username;
  const sqlQuery = `SELECT 
    a.username, 
    u.first_name, 
    u.last_name, 
    u.birth_date, 
    u.sex, 
    u.email, 
    u.email, 
    u.address, 
    u.join_date 
    FROM 
    user_access a JOIN 
    users u ON a.user_id = u.id
    WHERE a.username = ? `;
  db.query(sqlQuery, [username], (err, result) => {
    if (err) return res.status(500).json({msg: 'Something went wrong', err});
    if (result.length == 0) {
      return res.status(404).json({msg: `User can't be found`});
    }
    const birth_date = result[0].birth_date,
      join_date = result[0].join_date;
    const sex =
      result[0].sex == 'M' ? 'Male' : result[0].sex == 'F' ? 'Female' : '';
    let searchResult = result;
    searchResult = {
      ...searchResult[0],
      birth_date: grabLocalYMD(birth_date),
      join_date: grabLocalYMD(join_date),
      sex,
    };
    return res.status(200).json(searchResult);
  });
});

module.exports = userRouter;