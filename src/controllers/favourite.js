const sendResponse = require('../helpers/sendResponse');
const favModel = require('../models/favourite');

const addFovourite = (req, res) => {
  const {
    payload: {user_id},
    body: {vehicle_id},
  } = req;
  favModel
    .addFovourite(user_id, vehicle_id)
    .then(({status, result}) => {
      sendResponse.success(res, status, {
        msg: 'Item Added to Favourite',
        data: {
          id: result.insertId,
          category,
        },
      });
    })
    .catch((err) => {
      sendResponse.error(res, 500, {errMsg: 'Adding favourite failed.', err});
    });
};

const getFavourite = (req, res) => {
  const {
    payload: {user_id},
  } = req;
  favModel
    .getFavourite(user_id)
    .then(({status, result}) => {
      if (status == 204) {
        sendResponse.success(res, status, {
          msg: 'Favourite is empty.',
          data: '',
        });
      }
      sendResponse.success(res, status, {
        msg: 'Favourite',
        data: result,
      });
    })
    .catch((err) =>
      sendResponse.error(res, 500, {errMsg: 'Something went wrong.', err}),
    );
};

const deleteFavourite = (req, res) => {
  const {
    params: {id},
  } = req;
  favModel
    .deleteFavourite(id)
    .then(({status, result}) => {
      return sendResponse.success(res, status, {
        msg: 'Favourite item deteled.',
        data: {id},
      });
    })
    .catch((err) => {
      sendResponse.error(res, 500, {
        errMsg: 'Something when wrong',
        err,
      });
    });
};

module.exports = {
  addFovourite,
  getFavourite,
  deleteFavourite,
};
