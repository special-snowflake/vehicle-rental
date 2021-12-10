const mysql = require('mysql');
const db = require('../config/db');
const modelHelp = require('../helpers/modelsHelper');

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

const getAllVehicles = (query) => {
  return new Promise((resolve, reject) => {
    let {orderBy, sort, limit, page} = query;
    let offset = '';
    const sqlCount = `SELECT count(*) count FROM vehicles`;
    const sqlShowData = `SELECT 
    v.id, c.city, ct.category, v.model, v.brand, 
    v.capacity, v.price FROM vehicles v
    JOIN city c ON v.city_id = c.id
    JOIN category ct ON v.category_id = ct.id
    ORDER BY  ? ?
    LIMIT ?,?`;
    if (orderBy !== '' && typeof orderBy !== 'undefined') {
      if (typeof sort !== 'undefined') {
        sort = sort.toLocaleLowerCase() === 'desc' ? ' DESC' : ' ASC';
      } else {
        sort = ' ASC';
      }
    } else {
      orderBy = 'v.id';
      sort = ' ASC';
    }
    if (!limit) {
      limit = '5';
    }
    if (!page) {
      page = '1';
      offset = 0;
    } else {
      offset = (+page - 1) * +limit;
    }
    const prepare = [
      mysql.raw(orderBy),
      mysql.raw(sort),
      offset,
      mysql.raw(limit),
    ];
    db.query(sqlCount, (err, result) => {
      if (err) reject(err);
      const count = result[0].count;
      const sortSpliced = sort.slice(1, sort.length);
      const nextOffset = +offset + +limit;
      const nPage = nextOffset > count ? null : +page + 1;
      const pPage = page > 1 ? +page - 1 : null;
      const nextPage =
        nPage != null ?
          '/vehicles?orderBy=' +
            orderBy +
            '&&sort=' +
            sortSpliced +
            '&&limit=' +
            limit +
            '&&page=' +
            nPage :
          null;
      const previousPage =
        pPage != null ?
          '/vehicles?orderBy=' +
            orderBy +
            '&&sort=' +
            sortSpliced +
            '&&limit=' +
            limit +
            '&&page=' +
            pPage :
          null;
      db.query(sqlShowData, prepare, (err, result) => {
        if (err) return reject(err);
        modelHelp.rejectOrResolve(
          err,
          {previousPage, page, nextPage, result},
          resolve,
          reject,
        );
      });
    });
  });
};

const getDataForUpdate = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM vehicles WHERE id = ?`;
    db.query(sqlQuery, [id], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

const getVehiclesById = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM vehiclse WHERE id = ?`;
    db.query(sqlQuery, [id], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
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
      modelHelp.rejectOrResolve(err, result, resolve, reject);
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
      modelHelp.rejectOrResolve(err, result, resolve, reject);
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

const checkInputCategory = (category) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT id FROM category WHERE category = ?`;
    db.query(sqlQuery, [category], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

const checkInputCity = (city) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT id FROM city WHERE city = ?`;
    db.query(sqlQuery, [city], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

module.exports = {
  getVehicles,
  getAllVehicles,
  updateVehicle,
  addNewVehicle,
  deleteVehicle,
  checkInputCategory,
  checkInputCity,
  getDataForUpdate,
  getVehiclesById,
};
