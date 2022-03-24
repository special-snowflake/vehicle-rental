const jwt = require('jsonwebtoken');
const resHelper = require('../helpers/sendResponse.js');
const db = require('../config/db');

const authorizeCustomer = (req, res, next) => {
  const token = req.header('x-authorized-token');
  const jwtOptions = {
    issuer: process.env.ISSUER,
  };
  const sqlGetBlackList = `SELECT token FROM blacklist_token WHERE token = ?`;
  db.query(sqlGetBlackList, [token], (err, result) => {
    if (err) {
      return resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    }
    if (result.length !== 0) {
      return resHelper.success(res, 403, {
        errMsg: 'You need to login to perform this action.',
        err_code: 'INVALID_TOKEN',
      });
    }
    jwt.verify(token, process.env.SECRET_KEY, jwtOptions, (err, payload) => {
      if (err) {
        return resHelper.error(res, 403, {
          errMsg: 'You need to login to perform this action.',
          err_code: 'INVALID_TOKEN',
        });
      }
      // console.log(payload);
      const {roles} = payload;
      if (roles.toLowerCase() !== 'customer') {
        return resHelper.error(res, 403, {
          errMsg: 'You need to login as Customer to perform this action.',
        });
      }
      req.payload = payload;
      next();
    });
  });
};

const authorizeAdmin = (req, res, next) => {
  const token = req.header('x-authorized-token');
  const jwtOptions = {
    issuer: process.env.ISSUER,
  };
  const sqlGetBlackList = `SELECT token FROM blacklist_token WHERE token = ?`;
  db.query(sqlGetBlackList, [token], (err, result) => {
    if (err) {
      return resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    }
    if (result.length !== 0) {
      return resHelper.error(res, 403, {
        errMsg: 'You need to login to perform this action.',
        err_code: 'INVALID_TOKEN',
      });
    }
    jwt.verify(token, process.env.SECRET_KEY, jwtOptions, (err, payload) => {
      if (err) {
        return resHelper.error(res, 403, {
          errMsg: 'You need to login to perform this action.',
          err_code: 'INVALID_TOKEN',
        });
      }
      const {roles} = payload;
      if (roles.toLowerCase() !== 'admin') {
        return resHelper.error(res, 403, {
          errMsg: 'You need to login as Admin to perform this action.',
        });
      }
      req.payload = payload;
      next();
    });
  });
};

const authorizeOwner = (req, res, next) => {
  const token = req.header('x-authorized-token');
  const jwtOptions = {
    issuer: process.env.ISSUER,
  };
  const sqlGetBlackList = `SELECT token FROM blacklist_token WHERE token = ?`;
  db.query(sqlGetBlackList, [token], (err, result) => {
    if (err) {
      return resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    }
    if (result.length !== 0) {
      return resHelper.error(res, 403, {
        errMsg: 'You need to login to perform this action.',
        err_code: 'INVALID_TOKEN',
      });
    }
    jwt.verify(token, process.env.SECRET_KEY, jwtOptions, (err, payload) => {
      if (err) {
        console.log('token', token);
        console.log('error verify', err);
        return resHelper.error(res, 403, {
          errMsg: 'You need to login to perform this action.',
          err_code: 'INVALID_TOKEN',
        });
      }
      const {roles} = payload;
      // console.log('roles', roles);
      if (roles.toLowerCase() !== 'owner') {
        return resHelper.error(res, 403, {
          errMsg: 'You need to login as Owner to perform this action.',
        });
      }
      req.payload = payload;
      next();
    });
  });
};

const authorizeAllUser = (req, res, next) => {
  const token = req.header('x-authorized-token');
  console.log('token:', token);
  console.log('req:', req.body);
  const jwtOptions = {
    issuer: process.env.ISSUER,
  };
  const sqlGetBlackList = `SELECT token FROM blacklist_token WHERE token = ?`;
  console.log(token);
  db.query(sqlGetBlackList, [token], (err, result) => {
    if (err) {
      return resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    }
    if (result.length !== 0) {
      console.log('failed auth middleware');
      return resHelper.success(res, 403, {
        errMsg: 'You need to login to perform this action.',
        err_code: 'INVALID_TOKEN',
      });
    }
    jwt.verify(token, process.env.SECRET_KEY, jwtOptions, (err, payload) => {
      console.log('failed auth middleware 2', token);
      if (err) {
        return resHelper.error(res, 403, {
          errMsg: 'You need to login to perform this action.',
          err_code: 'INVALID_TOKEN',
        });
      }
      req.payload = payload;
      next();
    });
  });
};

module.exports = {
  authorizeCustomer,
  authorizeAdmin,
  authorizeAllUser,
  authorizeOwner,
};
