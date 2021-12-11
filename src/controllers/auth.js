const authModel = require('../models/auth');
const resHelper = require('../helpers/sendResponse');
const db = require('../config/db');

const register = (req, res) => {
  const {body} = req;
  authModel
    .register(req.body)
    .then(({status}) => {
      delete body.password;
      resHelper.success(res, status, {msg: 'Registration complete.', body});
    })
    .catch((err) => {
      if (err.errno == 1062) {
        return resHelper.error(res, 409, {
          errorMassage: 'Your email/username is already registered.',
        });
      }
      resHelper.error(res, 500, err);
    });
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
        msg: `Login Failed. Check your email/username and password.`,
        err,
      });
    });
};

const logout = (req, res) => {
  const token = req.header('x-authorized-token');
  console.log('[DB] token: ', token);
  authModel
    .logout(token)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, {msg: 'Something went wrong.', err});
    });
};

module.exports = {register, login, logout};
