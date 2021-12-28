const modelUser = require('../models/user');
const resHelper = require('../helpers/sendResponse');

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
      resHelper.error(res, 500, {msg: 'Something went wrong', err});
    });
};

const updateUser = (req, res) => {
  const {bodyUpdate, isPassFilter, payload} = req;
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
      const results = {msg: 'User updated.', data: {id, ...bodyUpdate}};
      return resHelper.success(res, status, results);
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
      resHelper.error(res, 500, {msg: 'Something went wrong.', err});
    });
};

module.exports = {
  getUserById,
  updateUser,
  getUserByName,
  deleteUser,
  changeUserRoles,
};
