const db = require('../config/db');
const mysql = require('mysql');

const getVehicles = (req, res) => {
  const {params} = req;
  const category = params.category;
  console.log(params.category);
  let sqlQuery = ``;
  let msg = '';
  if (category.toLocaleLowerCase() === 'popular') {
    sqlQuery = `SELECT 
      v.id,
      c.city, 
      v.brand,
      v.model,
      count(h.vehicle_id) 
      jml_vhc 
      FROM history h 
      JOIN vehicles v 
      ON v.id = h.vehicle_id
      JOIN city c on c.id = v.city_id
      group by h.vehicle_id
      ORDER BY jml_vhc DESC
      LIMIT 10`;
    msg = 'Popular in Town:';
  }
  let keyword = ``;
  if (
    typeof category.toLocaleLowerCase() !== 'undefined' &&
    category.toLocaleLowerCase() !== 'popular'
  ) {
    keyword = category;
    msg = `Popular ${category}`;
    sqlQuery = `SELECT 
      v.id,
      v.brand,
      v.model,
      ct.category, c.city  
      FROM history h 
      JOIN vehicles v ON v.id = h.vehicle_id 
      JOIN city c ON c.id = v.city_id 
      JOIN category ct ON ct.id = v.category_id
      WHERE ct.category = ? 
      GROUP BY v.id 
      ORDER BY (count(h.vehicle_id))
      LIMIT 10`;
  }
  db.query(sqlQuery, [keyword], (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    }
    if (result.length == 0) {
      msg = `Category can't be  found`;
      return res.status(200).json({msg});
    }
    return res.status(200).json({
      msg,
      result,
    });
  });
};

const getAllVehicles = (req, res) => {
  let {
    query: {orderBy, sort},
  } = req;
  let sqlQuery = `SELECT 
  v.id, c.city, ct.category, v.model, v.brand, 
  v.capacity, v.price FROM vehicles v
  JOIN city c ON v.city_id = c.id
  JOIN category ct ON v.category_id = ct.id`;
  if (orderBy !== '' && typeof orderBy !== 'undefined') {
    if (typeof sort !== 'undefined') {
      sort = sort.toLocaleLowerCase() === 'desc' ? ' DESC' : ' ASC';
    } else {
      sort = ' ASC';
    }
    sqlQuery = `SELECT 
    v.id, c.city, ct.category, v.model, v.brand, 
    v.capacity, v.price FROM vehicles v
    JOIN city c ON v.city_id = c.id
    JOIN category ct ON v.category_id = ct.id
    ORDER BY  ? ?`;
  }
  db.query(sqlQuery, [mysql.raw(orderBy), mysql.raw(sort)], (err, result) => {
    if (err) {
      if (err.code == 'ER_BAD_FIELD_ERROR') {
        return res.status(500).json({msg: 'Wrong input orderBy'});
      }
      return res.status(500).json({msg: 'Something went wrong ', err});
    }
    res.status(200).json({msg: 'Vehilces: ', result});
  });
};

const addNewVehicle = (req, res) => {
  const {
    body: {
      brand,
      model,
      capacity,
      price,
      status,
      stock,
      cityID,
      categoryID,
      category,
      city,
    },
  } = req;
  const prepare = [
    categoryID,
    cityID,
    brand,
    model,
    capacity,
    price,
    status,
    stock,
  ];
  console.log(prepare);
  const sqlQuery = `
    INSERT INTO vehicles 
    ( category_id, city_id, brand, model, capacity, price, status, stock) 
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?);`;
  db.query(sqlQuery, prepare, (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    }
    return res.status(200).json({
      msg: 'New Item is Added to Vehicles',
      category,
      city,
      brand,
      model,
      capacity,
      price,
      status,
      stock,
    });
  });
};

const updateVehicle = (req, res) => {
  const {
    bodyUpdate: {
      id,
      category_id,
      city_id,
      brand,
      model,
      capacity,
      price,
      status,
      stock,
    },
  } = req;
  const params = [
    category_id,
    city_id,
    brand,
    model,
    capacity,
    price,
    status,
    stock,
    id,
  ];
  const sqlQuery = `UPDATE vehicles SET 
    category_id = ?,
    city_id = ?,
    brand = ?,
    model = ?,
    capacity = ?,
    price = ?,
    status = ?,
    stock = ?
    WHERE id = ?;`;
  db.query(sqlQuery, params, (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: 'Something went wrong.',
        err,
      });
    }
    return res.status(200).json({
      msg: 'Data successfully updated.',
      newData: req.bodyUpdate,
    });
  });
};

const deleteVehicle = (req, res) => {
  const {
    body: {id},
  } = req;
  const sqlQuery = `DELETE FROM vehicles where id = ?`;
  db.query(sqlQuery, [id], (err, result) => {
    if (err) {
      return res.status(500).json({msg: 'Something went wrong', err});
    }
    return res.status(200).json({msg: 'Vehicle deleted', id, result});
  });
};

module.exports = {
  getVehicles,
  addNewVehicle,
  updateVehicle,
  getAllVehicles,
  deleteVehicle,
};
