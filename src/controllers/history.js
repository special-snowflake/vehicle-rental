/* eslint-disable camelcase */
const mysql = require('mysql');

const modelHistory = require('../models/history');
const resHelper = require('../helpers/sendResponse');

const {grabLocalYMD} = require('../helpers/collection');

const addHistory = (req, res) => {
  const {body} = req;
  console.log(body);
  modelHistory
    .modelAddHistory(body)
    .then(({status, result}) => {
      const data = {
        ...body,
        id: result.insertId,
      };
      resHelper.success(res, status, {
        msg: 'New History Added',
        data,
      });
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

const searchHistory = (req, res) => {
  modelHistory
    .searchHistory(req)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      return resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

const getHistoryById = (req, res) => {
  const {
    params: {id},
  } = req;
  modelHistory
    .getHistoryById(id)
    .then(({status, result}) => {
      return resHelper.success(res, status, {
        msg: 'Detail History',
        data: result,
      });
    })
    .catch((err) => {
      return resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

const getHistory = (req, res) => {
  const {
    query: {order, sort, userId},
  } = req;
  let orderBy = ``;
  let whereId = ``;
  if (typeof userId !== 'undefined' && userId !== '') {
    whereId = ` WHERE user_id = ${userId}`;
  }
  if (typeof order !== 'undefined' && order !== '') {
    orderBy = ` ORDER BY ${order}`;
    if (typeof sort !== 'undefined') {
      if (sort.toLocaleLowerCase() === 'desc') {
        orderBy += ` DESC`;
      }
    }
  }
  const prepare = [mysql.raw(whereId), mysql.raw(orderBy)];
  modelHistory
    .modelGetHistory(prepare)
    .then(({status, result}) => {
      if (result.length == 0) {
        return resHelper.success(res, status, {
          msg: `There's not a single history found.`,
        });
      }
      const history = [];
      result.forEach((_element, index) => {
        history[index] = result[index];
        const rentalDate = grabLocalYMD(history[index].rental_date);
        const returnDate = grabLocalYMD(history[index].return_date);
        history[index] = {
          ...history[index],
          rental_date: rentalDate,
          return_date: returnDate,
        };
      });
      return resHelper.success(res, status, {
        msg: 'History:',
        meta: {
          totalData: result.length,
        },
        data: history,
      });
    })
    .catch((err) => {
      resHelper.error(res, 500, {
        errMsg: 'Data history cannot be retrieved.',
        err,
      });
    });
};

const updateHistory = (req, res) => {
  const {bodyUpdate} = req;
  const prepare = [
    (vehicle_id = bodyUpdate.vehicle_id),
    (user_id = bodyUpdate.user_id),
    (rental_date = bodyUpdate.rental_date),
    (return_date = bodyUpdate.return_date),
    (return_status = bodyUpdate.return_status),
    (unit = bodyUpdate.unit),
    (total_payment = bodyUpdate.total_payment),
    (id = bodyUpdate.id),
  ];
  modelHistory
    .modelUpdateHistory(prepare)
    .then(({status}) => {
      resHelper.success(res, status, {
        msg: 'History is updated.',
        data: bodyUpdate,
      });
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Something went wrong.', err});
    });
};

const deleteHistory = (req, res) => {
  modelHistory
    .deleteHistory(req)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, err);
    });
};

module.exports = {
  addHistory,
  getHistory,
  updateHistory,
  deleteHistory,
  searchHistory,
  getHistoryById,
};
