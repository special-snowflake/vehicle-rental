const db = require('../config/db.js');

const modelUser = require('../models/user');
const resHelper = require('../helpers/sendResponse');
const {grabLocalYMD} = require('../helpers/collection');

const uploadProfilePicture = (req, res) => {
  if (!req.isPassFilter) {
    return resHelper.success(res, 422, {
      result: {
        msg: 'File should be an image in either format (png, jpg, jpeg)',
      },
    });
  }
  const {payload, file} = req;
  const id = payload.id;
  const filename = file.filename;
  modelUser
    .uploadProfilePicture(id, filename)
    .then(({status, result}) => {
      if (status == 403) return resHelper.success(res, status, result);
      return resHelper.success(res, status, {
        msg: 'Upload photo profile success.',
        id,
        filename,
      });
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Error while uploading.', err});
    });
};

const updateProfilePicture = (req, res) => {
  if (!req.isPassFilter) {
    return resHelper.success(res, 422, {
      result: {
        msg: 'File should be an image in either format (png, jpg, jpeg)',
      },
    });
  }
  const {payload, file} = req;
  const id = payload.id;
  const filename = file.filename;
  modelUser
    .updateProfilePicture(id, filename)
    .then(({status}) => {
      return resHelper.success(res, status, {
        msg: 'Update photo profile success.',
        result: {
          id,
          filename,
        },
      });
    })
    .catch((err) => {
      resHelper.error(res, 500, {errorMsg: 'Error while updating.', err});
    });
};

const getUserByUnsername = (req, res) => {
  const {params} = req;
  const username = params.username;
  const sqlQuery = `SELECT 
      a.username, 
      u.first_name, 
      u.last_name, 
      u.bod, 
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
    const bod = result[0].bod,
      join_date = result[0].join_date;
    const sex =
      result[0].sex == 'M' ? 'Male' : result[0].sex == 'F' ? 'Female' : '';
    let searchResult = result;
    searchResult = {
      ...searchResult[0],
      bod: grabLocalYMD(bod),
      join_date: grabLocalYMD(join_date),
      sex,
    };
    return res.status(200).json(searchResult);
  });
};

const getUserByName = (req, res) => {
  const {query} = req;
  modelUser
    .searchUserByName(query)
    .then(({status, result}) => {
      if (result.result.length == 0) {
        return resHelper.success(res, status, {
          msg: `0 user found with that name.`,
        });
      }
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, {msg: 'Something went wrong', err});
    });
};

const updateUser = (req, res) => {
  const {bodyUpdate, isPassFilter, payload} = req;
  console.log('[db] ctrl updt usr photo:', bodyUpdate);
  if (!isPassFilter && req.file) {
    return resHelper.success(res, 422, {
      result: {
        msg: 'File should be an image in either format (png, jpg, jpeg)',
      },
    });
  }
  const id = payload.id;
  modelUser
    .updateUser(bodyUpdate, id)
    .then(({status, result}) => {
      return resHelper.success(res, status, {result: {bodyUpdate, id}});
    })
    .catch((err) => {
      resHelper.error(res, 500, err);
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
  uploadProfilePicture,
  updateProfilePicture,
};
