const resHelper = require('../helpers/sendResponse');
const validateLogin = (req, res, next) => {
  const user = req.body.user;
  const password = req.body.password;
  if (!password || password == '' || !user || user == '') {
    return resHelper.error(res, 400, {errMsg: 'Wrong Input.'});
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
    return resHelper.error(res, 400, {
      errMsg: 'Wrong Input. Please check your input.',
    });
  }
  next();
};

const validateAddVehicle = (req, res, next) => {
  const {
    body: {category, city, name, capacity, price, status, stock},
  } = req;
  console.log(req.body);
  if (
    !category ||
    category === '' ||
    !city ||
    city === '' ||
    !name ||
    !capacity ||
    capacity === '' ||
    !price ||
    price === '' ||
    !status ||
    !stock ||
    stock === ''
  ) {
    return resHelper.error(res, 400, {
      errMsg: 'All Field Should Be Filled.',
    });
  }
  if (!req.files) {
    return resHelper.error(res, 400, {
      errMsg: 'Please add images.',
    });
  }
  console.log('db body inside validate', req.body);
  const {imagePath} = req;
  return resHelper.success(res, 200, {
    msg: 'success',
    imagepath: imagePath,
    body: req.body,
  });
  // next();
};

module.exports = {validateLogin, validateRegister, validateAddVehicle};
