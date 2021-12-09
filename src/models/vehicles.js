const mysql = require('mysql');
const db = require('../config/db');

const getVehicles = (category) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = ``;
    let msg = '';
    if (category.toLocaleLowerCase() === 'popular') {
      msg = 'Popular in Town:';
      sqlQuery = `
        SELECT v.id, c.city, v.brand, v.model,
        count(h.vehicle_id) jml_vhc 
        FROM history h 
        JOIN vehicles v 
        ON v.id = h.vehicle_id
        JOIN city c on c.id = v.city_id
        group by h.vehicle_id
        ORDER BY jml_vhc DESC
        LIMIT 10`;
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
        return reject(err);
      }
      if (result.length == 0) {
        msg = `Category can't be  found`;
        return resolve({status: 200, msg});
      }
      return resolve({status: 200, result: {msg, result}});
    });
  });
};

const getAllVehicles = (orderBy, sort) => {
  return new Promise((resolve, reject) => {
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
        return reject(err);
      }
      resolve({status: 200, result});
    });
  });
};

const updateVehicle = (params) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `
    UPDATE vehicles SET 
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
        return reject(err);
      }
      return resolve({
        status: 200,
        result: {
          msg: 'Data successfully updated.',
          newData: req.bodyUpdate,
        },
      });
    });
  });
};

const addNewVehicle = (prepare) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `
    INSERT INTO vehicles 
    ( category_id, city_id, brand, model, capacity, price, status, stock) 
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?);`;
    db.query(sqlQuery, prepare, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({status: 200, result});
    });
  });
};

const deleteVehicle = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `DELETE FROM vehicles where id = ?`;
    db.query(sqlQuery, [id], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({status: 200, result});
    });
  });
};
module.exports = {
  getVehicles,
  getAllVehicles,
  updateVehicle,
  addNewVehicle,
  deleteVehicle,
};
