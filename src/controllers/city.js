const mysql = require('mysql');
const db = require('../config/db');

const addNewCity = (req, res) => {
  const {
    body: {city},
  } = req;
  const sqlQuery = `INSERT INTO city (city) VALUES (?)`;
  db.query(sqlQuery, [city], (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong while submitting city.',
        err,
      });
    return res.status(200).json({
      msg: 'New city Added',
      id: result.insertId,
      city,
    });
  });
};

const getCity = (req, res) => {
  const {query} = req;
  console.log(query.filter);
  const filter = query.filter == undefined ? '' : query.filter;
  const sqlQuery = `SELECT * FROM city ORDER BY city ?`;
  console.log(filter);
  db.query(sqlQuery, [mysql.raw(filter)], (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    if (result.length == 0) {
      return res.status(204).json({
        msg: 'city is empty',
      });
    }
    return res.status(200).json({
      msg: 'city',
      result,
    });
  });
};

const updateCity = (req, res) => {
  const sqlQuery = `UPDATE city SET city = ? where id = ?`;
  const params = [req.body.city, req.body.id];
  console.log(params);
  db.query(sqlQuery, params, (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something when wrong',
        err,
      });
    return res.status(200).json(result);
  });
};

const deleteCity = (req, res) => {
  const sqlQuery = `DELETE FROM city WHERE id = ?`;
  const param = [req.body.id];
  console.log(param);
  db.query(sqlQuery, param, (err, result) => {
    if (err) return res.status(500).json({msg: 'Something went wrong', err});
    return res.status(200).json({
      msg: 'Delete city success',
      id: req.body.id,
    });
  });
};

module.exports = {addNewCity, getCity, updateCity, deleteCity};
