const modelUser = require('../models/user');
const resHelper = require('../helpers/sendResponse');

const getUserById = (req, res) => {
  const {
    params: {id},
  } = req;
  modelUser
    .getUserById(id)
    .then(({status, result}) => {
      if (result.data.length == 0) {
        return resHelper.success(res, 404, {
          errMsg: `User Id ${id} cannot be found.`,
        });
      }
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      return resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

const getUserByName = (req, res) => {
  const {query} = req;
  modelUser
    .searchUserByName(query)
    .then(({status, result}) => {
      if (result.data.length == 0) {
        return resHelper.success(res, status, {
          msg: `0 user found with that name.`,
        });
      }
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Something went wrong', err});
    });
};

const updateUser = (req, res) => {
  const {bodyUpdate, isPassFilter, payload} = req;
  console.log('this is payload', payload);
  console.log('[db] ctrl updt usr photo:', bodyUpdate);
  if (!isPassFilter && req.file) {
    return resHelper.success(res, 400, {
      result: {
        errMsg: 'File should be an image in either format (png, jpg, jpeg).',
      },
    });
  }
  const id = payload.id;
  modelUser
    .updateUser(bodyUpdate, id)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      return resHelper.error(res, 500, err);
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
      resHelper.error(res, 500, {errMsg: 'Something went wrong', err});
    });
  console.log(body);
};

const changePassword = (req, res) => {
  const {
    body: {newPassword, oldPassword},
  } = req;
  if (newPassword === oldPassword) {
    return resHelper.error(res, 401, {
      errMsg: `New password cannot be the same as old password`,
    });
  }
  const id = req.payload.id;
  console.log(oldPassword, newPassword, id);
  modelUser
    .changePassword(oldPassword, newPassword, id)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

const changeUserRoles = (req, res) => {
  const {
    body: {userId, roles},
  } = req;
  modelUser
    .changeUserRoles(userId, roles)
    .then(({status, result}) => {
      resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

module.exports = {
  getUserById,
  updateUser,
  getUserByName,
  deleteUser,
  changeUserRoles,
  changePassword,
};
