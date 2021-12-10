const express = require('express');

const vehiclesRouter = express.Router();
const controllerVehicles = require('../controllers/vehicles');
const middleVehicles = require('../middlewares/vehicles');
const auth = require('../middlewares/authorize');

vehiclesRouter.get('/:category', controllerVehicles.getVehicles);
vehiclesRouter.get('/', controllerVehicles.getAllVehicles);
vehiclesRouter.get('/detail/:id', controllerVehicles.getDetailByID);
vehiclesRouter.get('/search/', controllerVehicles.searchVehicle);

vehiclesRouter.post(
  '/',
  auth.authorizeAdmin,
  middleVehicles.checkInputCategory,
  middleVehicles.checkInputCity,
  controllerVehicles.addNewVehicle
);

vehiclesRouter.patch(
  '/',
  auth.authorizeAdmin,
  middleVehicles.getDataForUpdate,
  controllerVehicles.updateVehicle
);

vehiclesRouter.delete(
  '/',
  auth.authorizeAdmin,
  middleVehicles.getDataForDelete,
  controllerVehicles.deleteVehicle
);

module.exports = vehiclesRouter;
