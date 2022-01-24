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

const deleteHistory = (req) => {
  return new Promise((resolve, reject) => {
    const {payload, body} = req;
    const historyIds = body.historyIds;
    console.log(historyIds[0]);
    const roles = payload.roles;
    const userID = payload.id;
    const timeStamp = getTimeStamp();
    const prepare = [];
    const sqlDeleteHistory = `UPDATE history, vehicles SET ? = ? 
    WHERE ? = ? AND history.id IN (?)`;
    let rolesId = 'vehicles.user_id';
    console.log('user roles delete:', roles);
    if (roles === 'owner') {
      prepare.push(mysql.raw('deleted_owner_at'));
    } else if (roles === 'customer') {
      rolesId = 'history.user_id';
      prepare.push(mysql.raw('deleted_customer_at'));
    } else {
      return resolve({status: 403, errMsg: 'Unauthorize access.'});
    }
    prepare.push(timeStamp);
    prepare.push(mysql.raw(rolesId));
    prepare.push(userID);
    let whereIn = '';
    for (let i = 0; i < historyIds.length; i++) {
      whereIn +=
        i !== historyIds.length - 1 ? historyIds[i] + ',' : historyIds[i];
    }
    prepare.push(mysql.raw(whereIn));
    db.query(sqlDeleteHistory, prepare, (err, result) => {
      if (err) return reject(err);
      console.log('result delete', result);
      resolve({status: 200, result: {msg: 'Delete success.'}});
    });
  });
};

const searchHistory = (req) => {
  return new Promise((resolve, reject) => {
    const {payload, query} = req;
    console.log('this is payload: ', payload);
    const keyword =
      query.keyword == '' || !query.keyword ? '%%' : `%${query.keyword}%`;
    let prevPage = '?keyword=' + query.keyword;
    let nextPage = '?keyword=' + query.keyword;
    const id = payload.id;
    const queryOrder = query.orderBy;
    let orderBy = '';
    let sort = 'asc';
    if (queryOrder === 'type') {
      orderBy = 'ct.category';
      prevPage += '&orderBy=' + queryOrder;
      nextPage += '&orderBy=' + queryOrder;
    } else if (queryOrder === 'name') {
      orderBy = 'v.name';
      prevPage += '&orderBy=' + queryOrder;
      nextPage += '&orderBy=' + queryOrder;
    } else {
      orderBy = 'h.created_at';
      sort = 'desc';
    }
    const roles = payload.roles;
    let sqlRoles = '';
    let statusDelete = '';
    if (roles === 'customer') {
      statusDelete = 'h.deleted_customer_at';
      sqlRoles = 'h.user_id ';
    } else if (roles === 'owner') {
      statusDelete = 'h.deleted_owner_at';
      sqlRoles = 'v.user_id ';
    } else {
      return resolve({status: 403, result: {errMsg: 'Unauthorized action.'}});
    }
    const prepare = [
      mysql.raw(statusDelete),
      mysql.raw(sqlRoles),
      id,
      keyword,
      mysql.raw(orderBy),
      mysql.raw(sort),
    ];
    const sqlCount = `SELECT count(*) as totalData
    FROM history h JOIN vehicles v ON v.id = h.vehicle_id 
    JOIN city c ON c.id = v.city_id
    JOIN category ct ON ct.id = v.category_id
    WHERE ? IS NULL AND
    ? = ? AND concat(v.name, c.city, ct.category) LIKE ?`;
    db.query(sqlCount, prepare, (err, result) => {
      if (err) {
        return reject(err);
      }
      const totalData = result[0].totalData;
      console.log('sqlcount:', totalData);
      let page = '';
      const limit = 3;
      let offset = null;
      if (query.page) {
        page = parseInt(query.page);
        offset = (page - 1) * limit;
        console.log('page, offset:', page, offset);
      } else {
        page = 1;
        offset = 0;
      }
      nextPage += '&page=' + (page + 1);
      prevPage += '&page=' + (page - 1);
      prepare.push(limit);
      prepare.push(offset);
      console.log('prepare: ', prepare);
      const totalPage = Math.ceil(totalData / limit);
      nextPage = page < totalPage ? nextPage : null;
      prevPage = page > 1 ? prevPage : null;
      console.log('totaldata, limit :', totalData, limit, totalPage);
      const meta = {
        totalData,
        previousPage: prevPage,
        page,
        nextPage,
        totalPage,
      };
      const sqlSearch = `SELECT h.id as history_id, v.name, h.rental_date, 
      h.return_date, h.return_status, h.total_payment,
      (SELECT image FROM vehicle_images 
        WHERE vehicle_id = v.id LIMIT 1) as image
        FROM history h JOIN vehicles v ON v.id = h.vehicle_id 
        JOIN city c ON c.id = v.city_id
        JOIN category ct ON ct.id = v.category_id
        WHERE ? IS NULL AND
        ? = ? AND concat(v.name, c.city, ct.category) 
        LIKE ? ORDER BY ? ? LIMIT ? OFFSET ?`;
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
        return resolve({
          status: 200,
          result: {msg: 'Search History.', meta, data: history},
        });
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
  deleteHistory,
  modelAddHistory,
  modelGetHistory,
  modelUpdateHistory,
  searchHistory,
};
