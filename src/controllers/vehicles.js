const vehiclesModel = require('../models/vehicles');
const resHelper = require('../helpers/sendResponse');

const getVehicles = (req, res) => {
  const {params} = req;
  vehiclesModel
    .getVehicles(params.category)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, err);
    });
};

const getDetailByID = (req, res) => {
  console.log('something');
  const {params} = req;
  vehiclesModel
    .getDetailByID(params.id)
    .then(({status, result}) => {
      if (result.data.length == 0) {
        return resHelper.success(res, status, {
          msg: `Vehicle with id ${params.id} cannot be found.`,
        });
      }
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, err);
    });
};

const searchVehicles = (req, res) => {
  const {query} = req;
  console.log('query:', query);
  vehiclesModel
    .searchVehicles(query)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      if (err.errno == 1054) {
        return resHelper.error(res, 400, {
          errMsg: 'Invalid orderBy, please check your input.',
        });
      }
      resHelper.error(res, 500, err);
    });
};

const addNewVehicle = (req, res) => {
  vehiclesModel
    .addNewVehicle(req)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      return resHelper.error(res, 500, {errMsg: 'Something went wrong', err});
    });
};

const updateVehicle = (req, res) => {
  console.log('[db] inside ctlr updt', req.images);
  vehiclesModel
    .updateVehicle(req)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, err);
    });
};

const deleteVehicle = (req, res) => {
  const {
    body: {id},
  } = req;
  vehiclesModel
    .deleteVehicle(id)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      resHelper.error(res, 500, {errMsg: 'Something went wrong', err});
    });
};

module.exports = {
  getVehicles,
  addNewVehicle,
  updateVehicle,
  deleteVehicle,
  getDetailByID,
  searchVehicles,
};
