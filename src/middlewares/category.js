const categoryModel = require('../models/category');
const sendResponse = require('../helpers/sendResponse');

const categoryAddVerification = (req, res, next) => {
  const {
    body: {category},
  } = req;
  categoryModel
    .modelCategoryAddVerivication(category)
    .then(({status, result}) => {
      console.log('here', status);
      if (status == 409) {
        console.log('bug 2');
        return sendResponse.success(res, status, {
          msg: 'Same category already exist.',
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

module.exports = categoryAddVerification;
