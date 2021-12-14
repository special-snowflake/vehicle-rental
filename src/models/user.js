const mysql = require('mysql');
const db = require('../config/db');
const modelHelp = require('../helpers/modelsHelper');
const fs = require('fs');

const searchUserByName = (query) => {
  return new Promise((resolve, reject) => {
    let {name, page, limit} = query;
    if (!limit) {
      limit = 5;
    }
    if (!page) {
      page = '1';
      offset = 0;
    } else {
      offset = (+page - 1) * +limit;
    }
    let keyword = `%%`;
    if (name !== '' && name) {
      keyword = `%${name}%`;
    }
    console.log('keyword, name: ', keyword, name);
    const prepare = [mysql.raw(keyword), mysql.raw(keyword), offset, limit];
    const sqlCount = `SELECT count(*) count FROM users 
    JOIN user_access u on users.id = u.user_id
    WHERE first_name LIKE '?' or last_name LIKE '?'`;
    const mysqlQuery = `SELECT users.id, users.first_name, users.last_name, 
    users.sex, users.email, users.phone, users.address,
     users.join_date, u.username
     FROM users 
     JOIN user_access u on users.id = u.user_id
     WHERE users.first_name LIKE '?' or users.last_name LIKE '?'
      LIMIT ?, ?`;
    db.query(sqlCount, prepare, (err, result) => {
      if (err) return reject(err);
      const count = result[0].count;
      const nextOffset = +offset + +limit;
      const nPage = nextOffset > count ? null : +page + 1;
      const pPage = page > 1 ? +page - 1 : null;
      const nextPage =
        nPage != null
          ? '/user?name=' + name + '&&limit=' + limit + '&&page=' + nPage
          : null;
      const previousPage =
        pPage != null
          ? '/user?name=' + name + '&&limit=' + limit + '&&page=' + pPage
          : null;
      db.query(mysqlQuery, prepare, (err, result) => {
        if (err) return reject(err);
        resolve({status: 200, result: {previousPage, page, nextPage, result}});
      });
    });
  });
};

const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQueryUA = `
    DELETE FROM user_access WHERE user_id = ?`;
    const sqlQueryUsers = `DELETE FROM users WHERE id = ?`;
    db.query(sqlQueryUA, [id], (err, result) => {
      if (err) return reject(err);
      db.query(sqlQueryUsers, [id], (err, result) => {
        if (err) return reject(err);
        resolve({status: 200, result});
      });
    });
  });
};

const uploadProfilePicture = (id, filename) => {
  return new Promise((resolve, reject) => {
    const sqlSelect = `SELECT photo FROM users WHERE id = ?`;
    db.query(sqlSelect, [id], (err, result) => {
      if (err) return reject(err);
      if (result[0].photo !== null) {
        fs.unlink(`../vehicle-rental/src/media/images/${filename}`, (err) => {
          if (err) {
            resolve({
              staus: 200,
              result: {msg: 'Error occur while deleting old photo.', err},
            });
          }
        });
        return resolve({
          status: 403,
          result: {
            msg: 'Photo already exist, use update profile picture, instead.',
          },
        });
      }
      const sqlUploadPhoto = `UPDATE users SET photo = ? WHERE id = ?`;
      db.query(sqlUploadPhoto, [filename, id], (err, result) => {
        modelHelp.rejectOrResolve(err, result, resolve, reject);
      });
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

const updateProfilePicture = (id, filename) => {
  return new Promise((resolve, reject) => {
    const sqlGetPrevPhoto = `SELECT photo from users where id = ?`;
    db.query(sqlGetPrevPhoto, [id], (err, result) => {
      if (err) return reject(err);
      if (result.length == 0) {
        return resolve({
          status: 401,
          result: {msg: 'Please upload before updating'},
        });
      }
      const photo = result[0].photo;
      db.query(sqlUploadPhoto, [filename, id], (err, result) => {
        fs.unlink(`../vehicle-rental/src/media/images/${photo}`, (err) => {
          if (err) {
            resolve({
              staus: 200,
              result: {msg: 'Error occur while deleting old photo.', err},
            });
          }
        });
        modelHelp.rejectOrResolve(err, result, resolve, reject);
      });
    });
    const sqlUploadPhoto = `UPDATE users SET photo = ? WHERE id = ?`;
  });
};

const getUserPhoto = (id) => {
  return new Promise((resolve, reject) => {
    const sqlSelect = `SELECT photo FROM users WHERE id = ?`;
    db.query(sqlSelect, [id], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

const updateUser = (body, id) => {
  return new Promise((resolve, reject) => {
    const sqlUpdate = `UPDATE users set ? WHERE id = ?`;
    db.query(sqlUpdate, [body, id], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

module.exports = {
  searchUserByName,
  deleteUser,
  uploadProfilePicture,
  updateProfilePicture,
  getUserPhoto,
  updateUser,
};
