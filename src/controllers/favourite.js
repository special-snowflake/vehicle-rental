const sendResponse = require('../helpers/sendResponse');
const favModel = require('../models/favourite');

const addFavourite = (req, res) => {
  const {
    payload: {id},
    body: {vehicle_id},
  } = req;
  favModel
    .addFavourite(vehicle_id, id)
    .then(({status, result}) => {
      return sendResponse.success(res, status, result);
    })
    .catch((err) => {
      return sendResponse.error(res, 500, {
        errMsg: 'Something went wrong',
        err,
      });
    });
};

const getFavourite = (req, res) => {
  const {
    payload: {id},
  } = req;
  // console.log(req);
  favModel
    .getFavourite(id)
    .then(({status, data}) => {
      if (status == 204) {
        sendResponse.success(res, status, {
          msg: 'Favourite is empty.',
          data: '',
        });
      }
      sendResponse.success(res, status, {
        msg: 'Favourite',
        data,
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
  addFavourite,
  getFavourite,
  deleteFavourite,
};
