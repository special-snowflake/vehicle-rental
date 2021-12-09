const cityModel = require('../models/city');
const sendResponse = require('../helpers/sendResponse');

const addcity = (req, res) => {
  const {
    body: {city},
  } = req;
  cityModel
    .modelAddcity(city)
    .then(({status, result}) => {
      sendResponse.success(res, status, {
        msg: 'New city Added',
        id: result.insertId,
      });
    })
    .catch((err) => {
      sendResponse.error(res, 500, {msg: 'Something went wrong.', err});
    });
};

const getcity = (req, res) => {
  const {query} = req;
  const filter = query.filter == undefined ? '' : query.filter;
  cityModel
    .modelGetcity(filter)
    .then(({status, result}) => {
      if (status == 204) {
        sendResponse.success(res, status, {msg: 'City is empty'});
      }
      sendResponse.success(res, status, {msg: 'City', result});
    })
    .catch((err) =>
      sendResponse.error(res, 500, {msg: 'Something went wrong', err})
    );
};

const updatecity = (req, res) => {
  cityModel
    .modelUpdatecity(req.body.city, req.body.id)
    .then(({status, result}) => {
      if (status == 200) {
        sendResponse.success(res, status, {
          msg: 'Data successfully updated',
          city: req.body.city,
          id: req.body.id,
        });
      }
    })
    .catch((err) => {
      sendResponse.error(res, 500, {
        msg: 'Something when wrong',
        err,
      });
    });
};

const deletecity = (req, res) => {
  const id = req.body.id;
  cityModel
    .modelDeletecity(id)
    .then(({status, result}) => {
      if (status == 209) {
        return sendResponse.success(res, status, {msg: 'No data deleted'});
      }
      sendResponse.success(res, status, {
        msg: 'Delete city success',
        id,
      });
    })
    .catch((err) => {
      sendResponse.error(res, 500, {
        msg: 'Something when wrong',
        err,
      });
    });
};

module.exports = {addcity, updatecity, deletecity, getcity};
