const authModel = require('../models/auth');
const resHelper = require('../helpers/sendResponse');

const register = (req, res) => {
  const {body} = req;
  console.log(body);
  authModel
    .register(body)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Register failed.', err});
    });
};
const checkToken = (req, res) => {
  resHelper.success(res, 200, {msg: 'Token is valid', result: null});
};
const login = (req, res) => {
  const {body} = req;
  authModel
    .login(body)
    .then(({status, result}) => {
      resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, {
        errMsg: `Login Failed. Check your email/password.`,
        err,
      });
    });
};

const logout = (req, res) => {
  const token = req.header('x-authorized-token');
  authModel
    .logout(token)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, {msg: 'Something went wrong.', err});
    });
};

module.exports = {register, login, logout, checkToken};
