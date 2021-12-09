const express = require('express');

const vehiclesRouter = express.Router();
const controllerVehicles = require('../controllers/vehicles');
const middleVehicles = require('../middlewares/vehicles');

vehiclesRouter.get('/:category', controllerVehicles.getVehicles);
vehiclesRouter.get('/', controllerVehicles.getAllVehicles);


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

vehiclesRouter.delete(
  '/',
  middleVehicles.getDataForDelete,
  controllerVehicles.deleteVehicle
);

module.exports = vehiclesRouter;
