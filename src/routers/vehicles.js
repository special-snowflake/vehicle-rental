const express = require('express');

const vehiclesRouter = express.Router();
const controllerVehicles = require('../controllers/vehicles');
const middleVehicles = require('../middlewares/vehicles');

vehiclesRouter.get('/:category', controllerVehicles.getVehicles);

vehiclesRouter.post(
  '/',
  middleVehicles.checkInputCategory,
  middleVehicles.checkInputCity,
  controllerVehicles.addNewVehicle
);

vehiclesRouter.patch(
  '/',
  middleVehicles.getDataForUpdate,
  controllerVehicles.updateVehicle
);

module.exports = vehiclesRouter;
