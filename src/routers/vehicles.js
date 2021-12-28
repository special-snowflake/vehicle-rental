const express = require('express');

const vehiclesRouter = express.Router();
const controllerVehicles = require('../controllers/vehicles');
const middleVehicles = require('../middlewares/vehicles');
const auth = require('../middlewares/authorize');
const uploadMulti = require('../middlewares/uploadMulti');

vehiclesRouter.get('/search', controllerVehicles.searchVehicles);
vehiclesRouter.get('/:category', controllerVehicles.getVehicles);
vehiclesRouter.get('/detail/:id', controllerVehicles.getDetailByID);

vehiclesRouter.post(
  '/',
  auth.authorizeOwner,
  uploadMulti,
  controllerVehicles.addNewVehicle,
);

vehiclesRouter.patch(
  '/:id',
  auth.authorizeOwner,
  uploadMulti,
  controllerVehicles.updateVehicle,
);

vehiclesRouter.delete(
  '/',
  auth.authorizeOwner,
  controllerVehicles.deleteVehicle,
);

module.exports = vehiclesRouter;
