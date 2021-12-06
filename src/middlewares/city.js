const cityModel = require('../models/city');
const sendResponse = require('../helpers/sendResponse');

const cityAddVerification = (req, res, next) => {
  const {
    body: {city},
  } = req;
  cityModel
    .modelcityAddVerivication(city)
    .then(({status, result}) => {
      console.log('here', status);
      if (status == 409) {
        console.log('bug 2');
        return sendResponse.success(res, status, {
          msg: 'Same city already exist.',
        });
      }
      if (status == 200) {
        console.log('bug' + result);
        next();
      }
    })
    .catch((err) => {
      console.log('errrrorrr', err);
      sendResponse.error(res, 500, err);
    });
};

module.exports = cityAddVerification;
