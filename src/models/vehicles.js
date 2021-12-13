const {reject} = require('bcrypt/promises');
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
      SELECT h.vehicle_id, ct.city, c.category, v.brand,
      v.model, v.capacity, v.price
      FROM history h 
      LEFT join testimony t ON h.id = t.history_id 
      JOIN vehicles v ON v.id = h.vehicle_id
      JOIN city ct ON v.city_id = ct.id
      JOIN category c ON v.category_id = c.id
      GROUP BY h.vehicle_id 
      ORDER BY (0.5*avg(coalesce(t.rate,0))+(1-0.5)*count(h.vehicle_id)) DESC
      LIMIT 10`;
    }
    let keyword = ``;
    if (
      typeof category.toLocaleLowerCase() !== 'undefined' &&
      category.toLocaleLowerCase() !== 'popular'
    ) {
      keyword = category;
      msg = `Popular ${category}`;
      sqlQuery = `SELECT h.vehicle_id, ct.city, c.category, v.brand,
      v.model, v.capacity, v.price
      from history h 
      LEFT join testimony t ON h.id = t.history_id 
      JOIN vehicles v ON v.id = h.vehicle_id
      JOIN city ct ON v.city_id = ct.id
      JOIN category c ON v.category_id = c.id
      WHERE c.category = ?
      GROUP BY h.vehicle_id 
      ORDER BY (0.5*avg(coalesce(t.rate,0))+(1-0.5)*count(h.vehicle_id)) DESC
      LIMIT 10`;
    }
    db.query(sqlQuery, [keyword], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        msg = `Category can't be  found`;
        return resolve({status: 200, result: {msg}});
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
        nPage != null
          ? '/vehicles?orderBy=' +
            orderBy +
            '&&sort=' +
            sortSpliced +
            '&&limit=' +
            limit +
            '&&page=' +
            nPage
          : null;
      const previousPage =
        pPage != null
          ? '/vehicles?orderBy=' +
            orderBy +
            '&&sort=' +
            sortSpliced +
            '&&limit=' +
            limit +
            '&&page=' +
            pPage
          : null;
      db.query(sqlShowData, prepare, (err, result) => {
        if (err) return reject(err);
        modelHelp.rejectOrResolve(
          err,
          {previousPage, page, nextPage, result},
          resolve,
          reject
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

const getDetailByID = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT v.id, ct.category, v.brand, v.model,
     v.capacity, v.price, v.status, c.city  
    FROM vehicles v JOIN city c ON c.id = v.city_id 
    JOIN category ct ON ct.id = v.category_id 
    WHERE v.id = ?`;
    db.query(sqlQuery, [id], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

const searchVehicles = (query) => {
  return new Promise((resolve, reject) => {
    console.log(query);
    let {cityId, categorId, brand, model, minCapacity} = query;
    cityId = cityId == '' || !cityId ? '%%' : `%${cityId}%`;
    categorId = categorId == '' || !categorId ? '%%' : `%${categorId}%`;
    brand = brand == '' || !brand ? '%%' : `%${brand}%`;
    model = model == '' || !model ? '%%' : `%${model}%`;
    minCapacity = minCapacity == '' || !minCapacity ? '1' : minCapacity;
    const prepare = [cityId, categorId, brand, model, minCapacity];
    const sqlSearch = `SELECT v.id, v.model, v. brand, 
    v.stock, c.city, ct.category, v.price, v.capacity
    FROM vehicles v JOIN city c ON v.city_id = c.id
    JOIN category ct ON v.category_id = ct.id
    WHERE v.city_id LIKE ? and v.category_id LIKE ? 
    and v.brand LIKE ? and v.model LIKE ? and v.capacity >= ? `;
    db.query(sqlSearch, prepare, (err, result) => {
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
  getDetailByID,
  searchVehicles,
};
