const authModel = require('../models/auth');
const resHelper = require('../helpers/sendResponse');

const register = (req, res) => {
  const {body} = req;
//   const prepare = [
//     body.first_name,
//     body.last_name,
//     body.birth_date,
//     body.sex,
//     body.email,
//     body.phone,
//     body.address,
//     body.join_date,
//   ];
//   const password=body.pass
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

module.exports = {register};
