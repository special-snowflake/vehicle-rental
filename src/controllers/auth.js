const authModel = require('../models/auth');
const resHelper = require('../helpers/sendResponse');

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
          errorMassage: 'Your email is already registered.',
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
      resHelper.error(res, 500, {msg: 'Login Failed', err});
    });
};

module.exports = {register, login};
