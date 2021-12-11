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

const getAllVehicles = (req, res) => {
  console.log(req.payload);
  vehiclesModel
    .getAllVehicles(req.query)
    .then(({status, result}) => {
      return resHelper.success(res, status, result);
    })
    .catch((err) => {
      if (err.errno == '1054') {
        return resHelper.error(res, 500, {msg: 'Wrong input oderBy.'});
      }
      resHelper.error(res, 500, {msg: 'Something went wrong ', err});
    });
};

const getDetailByID = (req, res) => {
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

const searchVehicle = (req, res) => {};

const addNewVehicle = (req, res) => {
  const {
    body: {
      brand,
      model,
      capacity,
      price,
      status,
      stock,
      cityID,
      categoryID,
      category,
      city,
    },
  } = req;
  const prepare = [
    categoryID,
    cityID,
    brand,
    model,
    capacity,
    price,
    status,
    stock,
  ];
  vehiclesModel
    .addNewVehicle(prepare)
    .then(({status, result}) => {
      return resHelper.success(res, status, {
        msg: 'New Item is Added to Vehicles',
        id: result.insertId,
        category,
        city,
        brand,
        model,
        capacity,
        price,
        status,
        stock,
      });
    })
    .catch((err) => {
      resHelper.error(res, 500, err);
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
    .then(({status, result}) => {
      return resHelper.success(res, status, {
        result: {
          msg: 'Data successfully updated.',
          newData: req.bodyUpdate,
        },
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
  getAllVehicles,
  deleteVehicle,
  getDetailByID,
  searchVehicle,
};
