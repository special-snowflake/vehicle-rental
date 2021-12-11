const jwt = require('jsonwebtoken');
const resHelper = require('../helpers/sendResponse.js');

const authorizeCustomer = (req, res, next) => {
  const token = req.header('x-authorized-token');
  const jwtOptions = {
    issuer: process.env.ISSUER,
  };
  jwt.verify(token, process.env.SECRET_KEY, jwtOptions, (err, payload) => {
    if (err) {
      return resHelper.error(res, 403, {
        msg: 'You need to login to perform this action.',
      });
    }
    const {roles} = payload;
    if (roles.toLowerCase() !== 'customer') {
      return resHelper.error(res, 403, {
        msg: 'You need to login as Customer to perform this action.',
      });
    }
    req.payload = payload;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  const token = req.header('x-authorized-token');
  const jwtOptions = {
    issuer: process.env.ISSUER,
  };
  jwt.verify(token, process.env.SECRET_KEY, jwtOptions, (err, payload) => {
    if (err) {
      return resHelper.error(res, 403, {
        msg: 'You need to login to perform this action.',
        err,
      });
    }
    const {roles} = payload;
    if (roles.toLowerCase() !== 'admin') {
      return resHelper.error(res, 403, {
        msg: 'You need to login as Admin to perform this action.',
      });
    }
    req.payload = payload;
    console.log('[DB] payload in authorize: ', req);
    next();
  });
};

const authorizeAllUser = (req, res, next) => {
  const token = req.header('x-authorized-token');
  const jwtOptions = {
    issuer: process.env.ISSUER,
  };
  jwt.verify(token, process.env.SECRET_KEY, jwtOptions, (err, payload) => {
    if (err) {
      return resHelper.error(res, 403, {
        msg: 'You need to login to perform this action.',
      });
    }
    req.payload = payload;
    next();
  });
};

module.exports = {authorizeCustomer, authorizeAdmin, authorizeAllUser};
