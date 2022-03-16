const mysql = require('mysql');
const db = require('../config/db');

const modelHelp = require('../helpers/modelsHelper');

const addFovourite = (vehicleId, userId) => {
  return new Pormise((resolve, reject) => {
    const body = {
      vehicle_id: vehicleId,
      user_id: userId,
    };
    const sqlAddFav = `INSERT INTO favourite SET ?`;
    db.query(sqlAddFav, [body], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
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
  addFovourite,
  getFavourite,
  deleteFavourite,
};
