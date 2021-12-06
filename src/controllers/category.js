const mysql = require('mysql');
const db = require('../config/db');

const addCategory = (req, res) => {
  const {
    body: {category},
  } = req;
  const sqlQuery = `INSERT INTO category (category) VALUES (?)`;
  db.query(sqlQuery, [category], (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong while submitting category.',
        err,
      });
    return res.status(200).json({
      msg: 'New Category Added',
      id: result.insertId,
      category,
    });
  });
};

const getCategory = (req, res) => {
  const {query} = req;
  console.log(query.filter);
  const filter = query.filter == undefined ? '' : query.filter;
  const sqlQuery = `SELECT * FROM category ORDER BY category ?`;
  console.log(filter);
  db.query(sqlQuery, [mysql.raw(filter)], (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    if (result.length == 0) {
      return res.status(204).json({
        msg: 'Category is empty',
      });
    }
    return res.status(200).json({
      msg: 'Category',
      result,
    });
  });
};

const updateCategory = (req, res) => {
  const sqlQuery = `UPDATE category SET category = ? where id = ?`;
  const params = [req.body.category, req.body.id];
  db.query(sqlQuery, params, (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something when wrong',
        err,
      });
    return res.status(200).json(result);
  });
};

const deleteCategory = (req, res) => {
  const sqlQuery = `DELETE FROM category WHERE id = ?`;
  const param = [req.body.id];
  db.query(sqlQuery, param, (err, result) => {
    if (err) return res.status(500).json({msg: 'Something went wrong', err});
    return res.status(200).json({
      msg: 'Delete category success',
      id: req.body.id,
    });
  });
};

module.exports = {addCategory, updateCategory, deleteCategory, getCategory};
