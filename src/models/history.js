const mysql = require('mysql');
const db = require('../config/db');
const modelHelp = require('../helpers/modelsHelper');

const {grabLocalYMD, getTimeStamp} = require('../helpers/collection');

const modelCheckInputHistory = (id, unit) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT id, stock, price, status 
        FROM vehicles WHERE id = ?`;
    db.query(sqlQuery, [id], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({status: 404, result});
      }
      if (result[0].stock < unit) {
        return resolve({status: 403, result});
      }
      if (result[0].status !== 'Available') {
        return resolve({status: 403, result});
      }
      resolve({status: 200, result});
    });
  });
};

const modelGetUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT id FROM users WHERE id = ?`;
    db.query(sqlQuery, [userId], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({status: 404, result});
      }
      resolve({status: 200, result});
    });
  });
};

const modelGetDataForUpdate = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM history WHERE id = ?`;
    db.query(sqlQuery, [id], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({status: 409, result});
      }
      resolve({status: 200, result});
    });
  });
};

const modelGetDataForDelete = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = 'SELECT * FROM history WHERE id = ?';
    db.query(sqlQuery, [id], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        return resolve({status: 404, result});
      }
      resolve({status: 200, result});
    });
  });
};

const searchHistory = (req) => {
  return new Promise((resolve, reject) => {
    const {payload, query} = req;
    const keyword =
      query.keyword == '' || !query.keyword ? '%%' : `%${query.keyword}%`;
    const id = payload.id;
    const queryOrder = query.orderBy;
    let orderBy = '';
    if (queryOrder === 'type') orderBy = 'ct.category';
    if (queryOrder === 'date') orderBy = 'h.created_at';
    if (queryOrder === 'name') orderBy = 'v.name';
    const roles = payload.roles;
    let sqlSearch = '';
    const prepare = [id, keyword, mysql.raw(orderBy)];
    if (roles === 'customer') {
      sqlSearch = `SELECT h.id as history_id, v.name, h.rental_date, 
      h.return_date, h.return_status, h.total_payment,
      (SELECT image FROM vehicle_images 
        WHERE vehicle_id = v.id LIMIT 1) as image
      FROM history h JOIN vehicles v ON v.id = h.vehicle_id 
      JOIN city c ON c.id = v.city_id
      JOIN category ct ON ct.id = v.category_id
      WHERE h.user_id = ? AND concat(v.name, c.city, ct.category) 
      LIKE ? ORDER BY ? asc`;
    }
    if (roles === 'owner') {
      sqlSearch = `SELECT h.id as history_id, v.name, h.rental_date, 
      h.return_date, h.return_status, h.total_payment, 
      (SELECT image FROM vehicle_images 
        WHERE vehicle_id = v.id LIMIT 1) as image
      FROM history h JOIN vehicles v ON v.id = h.vehicle_id 
      JOIN city c ON c.id = v.city_id
      JOIN category ct ON ct.id = v.category_id
      WHERE v.user_id = ? AND concat(v.name, c.city, ct.category) 
      LIKE ? ORDER BY ? asc`;
    }
    db.query(sqlSearch, prepare, (err, result) => {
      if (err) return reject(err);
      const history = [];
      result.forEach((_element, index) => {
        history[index] = result[index];
        const rentalDate = grabLocalYMD(history[index].rental_date);
        const returnDate = grabLocalYMD(history[index].return_date);
        history[index] = {
          ...history[index],
          rental_date: rentalDate,
          return_date: returnDate,
        };
      });
      console.log(history);
      return resolve({
        status: 200,
        result: {msg: 'Search History.', data: history},
      });
    });
  });
};

const modelAddHistory = (body) => {
  return new Promise((resolve, reject) => {
    console.log('inside add history model :', body);
    const timeStamp = getTimeStamp();
    body = {...body, ...{created_at: timeStamp}};
    const sqlQuery = `INSERT INTO history SET ?`;
    db.query(sqlQuery, [body], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve({status: 200, result});
    });
  });
};

const modelGetHistory = (prepare) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT 
    h.id, v.name,  
    h.rental_date, 
    h.return_date, 
    h.return_status,
    h.total_payment
    FROM history h 
    JOIN vehicles v 
    ON h.vehicle_id = v.id 
    ?
    ?`;
    db.query(sqlQuery, prepare, (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

const modelUpdateHistory = (prepare) => {
  return new Promise((resolve, reject) => {
    const updateQuery = `UPDATE history SET
    vehicle_id = ?,
    user_id = ?,
    rental_date = ?,
    return_date = ?,
    return_status = ?,
    unit = ?,
    total_payment = ?
    WHERE id = ?;`;
    db.query(updateQuery, prepare, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve({status: 200, result});
    });
  });
};

module.exports = {
  modelCheckInputHistory,
  modelGetUserId,
  modelGetDataForUpdate,
  modelGetDataForDelete,
  modelAddHistory,
  modelGetHistory,
  modelUpdateHistory,
  searchHistory,
};
