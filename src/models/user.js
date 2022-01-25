const mysql = require('mysql');
const db = require('../config/db');
const modelHelp = require('../helpers/modelsHelper');
const {grabLocalYMD} = require('../helpers/collection');
const bcrypt = require('bcrypt');

const searchUserByName = (query) => {
  return new Promise((resolve, reject) => {
    let previousPage = `/user?`;
    let nextPage = `/user?`;
    let {name, page, limit} = query;
    if (name & (name !== '')) {
      previousPage += `name=${name}&`;
      nextPage += `name=${name}&`;
    } else {
      previousPage += `name&`;
      nextPage += `name&`;
    }
    if (!limit) {
      limit = 5;
    } else {
      limit = +limit;
    }
    previousPage += `limit=${limit}&`;
    nextPage += `limit=${limit}&`;
    if (!page) {
      page = 1;
      offset = 0;
    } else {
      page = +page;
      offset = (page - 1) * limit;
    }
    console.log('[db]', offset, page, limit);
    let keyword = `%%`;
    if (name !== '' && name) {
      keyword = `%${name}%`;
    }
    console.log('keyword, name: ', keyword, name);
    const prepare = [mysql.raw(keyword), offset, limit];
    const sqlCount = `SELECT count(*) count FROM users 
    JOIN user_access u on users.id = u.user_id
    WHERE full_name LIKE '?'`;
    const mysqlQuery = `SELECT users.id, users.full_name, 
    users.sex, users.email, users.phone, users.address,
     users.join_at, u.username
     FROM users 
     JOIN user_access u on users.id = u.user_id
     WHERE users.full_name LIKE '?'
      LIMIT ?, ?`;
    db.query(sqlCount, prepare, (err, result) => {
      if (err) return reject(err);
      const count = result[0].count;
      const nextOffset = +offset + +limit;
      const nPage = nextOffset > count ? null : +page + 1;
      const pPage = page > 1 ? +page - 1 : null;
      if (pPage !== null) {
        previousPage += `page=${pPage}`;
      } else {
        previousPage = null;
      }
      if (nPage !== null) {
        nextPage += `page=${nPage}`;
      } else {
        nextPage = null;
      }
      db.query(mysqlQuery, prepare, (err, result) => {
        if (err) return reject(err);
        const meta = {
          totalData: count,
          previousPage,
          page,
          nextPage,
        };
        resolve({
          status: 200,
          result: {msg: 'User search result.', meta, data: result},
        });
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

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sqlSelect = `SELECT * FROM users WHERE id = ?`;
    db.query(sqlSelect, [id], (err, result) => {
      console.log('result:', result);
      if (err) return reject(err);
      if (result.length !== 0) {
        if (!typeof result[0].dob === 'undefined') {
          const dob = grabLocalYMD(result[0].dob);
          result[0] = {...result[0], ...{dob}};
        }
        // console.log('result: ', result[0]);
        const joinAt = grabLocalYMD(result[0].join_at);
        result[0] = {...result[0], ...{join_at: joinAt}};
        // console.log(dob, joinAt);
        return resolve({
          status: 200,
          result: {
            msg: `User Id ${id}`,
            data: result[0],
          },
        });
      }
      return resolve({status: 404, result: {msg: `User data can't be found`}});
    });
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
      if (err) {
        if (err.errno === 1062) {
          return resolve({
            status: 400,
            result: {errMsg: 'Email is already used.'},
          });
        }
        return reject(err);
      }
      resolve({status: 200, result: {msg: 'Update success.', data: {body}}});
    });
  });
};

const changeUserRoles = (userId, roles) => {
  return new Promise((resolve, reject) => {
    const sqlUpdate = `UPDATE user_access
    SET roles = ?
    WHERE user_id = ?`;
    db.query(sqlUpdate, [roles, userId], (err, result) => {
      if (err) return reject(err.code, err.errno);
      return resolve({
        status: 200,
        result: {
          msg: 'User roles updated.',
          data: {
            userId,
            roles,
          },
        },
      });
    });
  });
};

const changePassword = (oldPassword, newPassword, id) => {
  return new Promise((resolve, reject) => {
    const sqlGetOldPassword =
      'SELECT password from user_access WHERE user_id = ?';
    console.log('old, new, id:', oldPassword, newPassword, id);
    db.query(sqlGetOldPassword, [id], (err, result) => {
      console.log('result from password', result);
      console.log('password from db :', result[0].password);
      if (err) return reject(err);
      const passwordHased = result[0].password;
      bcrypt.compare(oldPassword, passwordHased, (err, result) => {
        if (err) return reject(err);
        if (result === false) {
          const error = new Error('Old password is incorrect.');
          return reject(error.message);
        }
        console.log('password match');
        bcrypt
          .hash(newPassword, 10)
          .then((hashedPassword) => {
            const sqlUpdatePassword = `UPDATE user_access
            SET password = ?
            WHERE user_id = ?`;
            db.query(sqlUpdatePassword, [hashedPassword, id], (err, result) => {
              if (err) return reject(err);
              return resolve({
                status: 200,
                result: {msg: 'Update password success'},
              });
            });
          })
          .catch((err) => {
            return reject(err);
          });
      });
    });
  });
};
module.exports = {
  searchUserByName,
  deleteUser,
  getUserById,
  changeUserRoles,
  getUserPhoto,
  updateUser,
  changePassword,
};
