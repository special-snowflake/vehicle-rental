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
        msg: 'New city Added.',
        data: {
          id: result.insertId,
          city,
        },
      });
    })
    .catch((err) => {
      sendResponse.error(res, 500, {
        errMsg: 'Something went wrong. Add city failed.',
        err,
      });
    });
};

const getcity = (req, res) => {
  const {query} = req;
  const filter = query.filter == undefined ? '' : query.filter;
  cityModel
    .modelGetcity(filter)
    .then(({status, result}) => {
      if (status == 204) {
        sendResponse.success(res, status, {msg: 'City is empty', data: ''});
      }
      sendResponse.success(res, status, {
        msg: 'City',
        meta: {totalData: result.length},
        data: result,
      });
    })
    .catch((err) =>
      sendResponse.error(res, 500, {errMsg: 'Something went wrong.', err})
    );
};

const updatecity = (req, res) => {
  cityModel
    .modelUpdatecity(req.body.city, req.body.id)
    .then(({status}) => {
      sendResponse.success(res, status, {
        msg: 'Data successfully updated',
        data: {
          city: req.body.city,
          id: req.body.id,
        },
      });
    })
    .catch((err) => {
      sendResponse.error(res, 500, {
        errMsg: 'Something when wrong',
        err,
      });
    });
};

const deletecity = (req, res) => {
  const id = req.body.id;
  cityModel
    .modelDeletecity(id)
    .then(({status}) => {
      if (status == 209) {
        return sendResponse.success(res, status, {
          msg: 'Data already deleted.',
          data: {
            id,
          },
        });
      }
      sendResponse.success(res, status, {
        msg: 'City deleted.',
        data: {
          id,
        },
      });
    })
    .catch((err) => {
      sendResponse.error(res, 500, {
        errMsg: 'Something when wrong.',
        err,
      });
    });
};

module.exports = {addcity, updatecity, deletecity, getcity};
