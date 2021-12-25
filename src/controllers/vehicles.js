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
      if (result.length == 0) {
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
  vehiclesModel
    .searchVehicles(query)
    .then(({status, result}) => {
      resHelper.success(res, status, result);
    })
    .catch((err) => {
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
  const {
    bodyUpdate: {
      id,
      category_id,
      city_id,
      brand,
      model,
      capacity,
      price,
      status,
      stock,
    },
  } = req;
  const params = [
    category_id,
    city_id,
    brand,
    model,
    capacity,
    price,
    status,
    stock,
    id,
  ];
  vehiclesModel
    .updateVehicle(params, req)
    .then(({status, _result}) => {
      return resHelper.success(res, status, {
        msg: 'Vehicle successfully updated.',
        data: req.bodyUpdate,
      });
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
    .then(({status}) => {
      return resHelper.success(res, status, {
        msg: 'Vehicle deleted',
        id,
      });
    })
    .catch((err) => {
      resHelper.error(res, 500, {msg: 'Something went wrong', err});
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
