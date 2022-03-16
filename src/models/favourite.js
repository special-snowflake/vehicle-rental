const mysql = require('mysql');
const db = require('../config/db');

const modelHelp = require('../helpers/modelsHelper');

const addFavourite = (vehicleId, userId) => {
  return new Promise((resolve, reject) => {
    const body = {
      vehicle_id: vehicleId,
      user_id: userId,
    };
    console.log(body);
    const getId = `SELECT * FROM favourite 
    WHERE user_id = ? AND vehicle_id = ?`;
    db.query(getId, [userId, vehicleId], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length !== 0) {
        return resolve({
          status: 400,
          result: {
            msg: 'Is already favourite.',
          },
        });
      }
      const sqlAddFav = `INSERT INTO favourite SET ?`;
      db.query(sqlAddFav, [body], (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        console.log(result);
        return resolve({
          status: 200,
          result: {
            msg: 'New Vehicle Added.',
            data: {id: result.insertId},
          },
        });
        // if (result) console.log(result);
        // modelHelp.rejectOrResolve(err, result, resolve, reject);
      });
    });
  });
};

const deleteFavourite = (id) => {
  return new Promise((resolve, reject) => {
    const sqlRemove = `DELETE FROM favourite WHERE id = ?`;
    db.query(sqlRemove, [id], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

const getFavourite = (userId) => {
  return new Promise((resolve, reject) => {
    const sqlGetFav = `SELECT f.id, f.vehicle_id, v.name, c.category, ct.city, 
    v.price, (SELECT image FROM vehicle_images 
        WHERE vehicle_id = v.id ORDER BY id DESC LIMIT 1) as image
    FROM favourite f JOIN vehicles v ON v.id = f.vehicle_id 
    JOIN category c ON c.id = v.category_id
    JOIN city ct ON ct.id = v.city_id 
    WHERE f.user_id = ?`;
    db.query(sqlGetFav, [userId], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

module.exports = {
  addFavourite,
  getFavourite,
  deleteFavourite,
};
