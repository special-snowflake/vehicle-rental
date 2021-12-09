const db = require('../config/db.js');

const modelUser = require('../models/user');
const resHelper = require('../helpers/sendResponse');
const {grabLocalYMD} = require('../helpers/collection');

// const insertUserAccess = (req, res) => {
//   const id = req.inputResult.insertId;
//   const {
//     body: {username, password},
//   } = req;
//   const prepare = [id, username, password];
//   modelUser
//     .insertUserAccess(prepare)
//     .then(({status, result}) => {
//       return resHelper.success(res, status, {
//         msg: 'A New User Successfully Added',
//         id,
//       });
//     })
//     .catch((err) => {
//       resHelper.error(res, 500, {msg: 'Something went wrong', err});
//     });
// };

const getUserByUnsername = (req, res) => {
  const {params} = req;
  const username = params.username;
  const sqlQuery = `SELECT 
      a.username, 
      u.first_name, 
      u.last_name, 
      u.birth_date, 
      u.sex, 
      u.email, 
      u.email, 
      u.address, 
      u.join_date 
      FROM 
      user_access a JOIN 
      users u ON a.user_id = u.id
      WHERE a.username = ? `;
  db.query(sqlQuery, [username], (err, result) => {
    if (err) return res.status(500).json({msg: 'Something went wrong', err});
    if (result.length == 0) {
      return res.status(404).json({msg: `User cannot be found`});
    }
    const birth_date = result[0].birth_date,
      join_date = result[0].join_date;
    const sex =
      result[0].sex == 'M' ? 'Male' : result[0].sex == 'F' ? 'Female' : '';
    let searchResult = result;
    searchResult = {
      ...searchResult[0],
      birth_date: grabLocalYMD(birth_date),
      join_date: grabLocalYMD(join_date),
      sex,
    };
    return res.status(200).json(searchResult);
  });
};

const getUserByName = (req, res) => {
  const {query} = req;
  const name = query.name;
  modelUser
    .searchUserByName(name)
    .then(({status, result}) => {
      if (result.length == 0) {
        return resHelper.success(res, status, {
          msg: `0 user found with that name.`,
        });
      }
      const msg =
        result.length == 1 ? `1 User Found:` : `${result.length} Users Found:`;
      return resHelper.success(res, status, {
        msg,
        result,
      });
    })
    .catch((err) => {
      resHelper.error(res, 500, {msg: 'Something went wrong', err});
    });
};

const updateUser = (req, res) => {
  const {
    bodyUpdate: {
      id,
      first_name,
      last_name,
      birth_date,
      sex,
      email,
      phone,
      address,
    },
  } = req;
  const params = [
    first_name,
    last_name,
    birth_date,
    sex,
    email,
    phone,
    address,
    id,
  ];
  const sqlQuery = `UPDATE users SET 
      first_name = ?,
      last_name = ?,
      birth_date = ?,
      sex = ?,
      email = ?,
      phone = ?,
      address = ?
      WHERE id = ?;`;
  db.query(sqlQuery, params, (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong.',
        err,
      });
    return res.status(200).json({
      msg: 'Data successfully updated.',
      newData: req.bodyUpdate,
    });
  });
};

const deleteUser = (req, res) => {
  const {body} = req;
  modelUser
    .deleteUser(body.id)
    .then(({status, result}) => {
      console.log('controller then', status, result);
      return resHelper.success(res, status, {
        msg: `User with id ${body.id} is deleted`,
      });
    })
    .catch((err) => {
      console.log('controller catch' + err);
      resHelper.error(res, 500, {msg: 'Something went wrong', err});
    });
  console.log(body);
};

module.exports = {
  getUserByUnsername,
  updateUser,
  getUserByName,
  deleteUser,
};
