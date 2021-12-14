const resHelper = require('../helpers/sendResponse');
const validateLogin = (req, res, next) => {
  const user = req.body.user;
  const password = req.body.password;
  if (!password || password == '' || !user || user == '') {
    return resHelper.error(res, 400, {err: {msgError: 'Wrong Input.'}});
  }
  next();
};

const validateRegister = (req, res, next) => {
  const {
    body: {name, email, password},
  } = req;
  if (
    !name ||
    name == '' ||
    !email ||
    email == '' ||
    !password ||
    password == ''
  ) {
    return resHelper.error(res, 400, {err: {msgError: 'Wrong Input.'}});
  }
  next();
  // return resHelper.success(res, 200, {err: {msgError: 'Correct Input.'}});
};

module.exports = {validateLogin, validateRegister};
