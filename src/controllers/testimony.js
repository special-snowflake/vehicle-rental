const testimonyModel = require('../models/testimony');
const resHelper = require('../helpers/sendResponse');
const {grabLocalYMD} = require('../helpers/collection');

const getTestimony = (req, res) => {
  testimonyModel
    .getTestimony(req)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      return resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

const addNewTestimony = (req, res) => {
  const {
    body: {historyId, rate, testimony},
  } = req;
  const date = grabLocalYMD(new Date());
  console.log(date);
  testimonyModel
    .addNewTestimony(historyId, rate, testimony, date)
    .then(({status, result}) => {
      resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

const deleteTestimony = (req, res) => {
  const {
    body: {id},
  } = req;
  testimonyModel
    .deleteTestimony(id)
    .then(({status, result}) => {
      resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

module.exports = {addNewTestimony, getTestimony, deleteTestimony};
