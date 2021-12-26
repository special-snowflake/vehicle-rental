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
  auth.authorizeAdmin,
  uploadMulti,
  controllerVehicles.addNewVehicle
);

/*
vehiclesRouter.patch(
  '/',
  auth.authorizeAdmin,
  middleVehicles.getDataForUpdate,
  controllerVehicles.updateVehicle
);
*/

vehiclesRouter.patch('/', uploadMulti, controllerVehicles.updateVehicle);

vehiclesRouter.delete(
  '/',
  auth.authorizeAdmin,
  middleVehicles.getDataForDelete,
  controllerVehicles.deleteVehicle
);

module.exports = vehiclesRouter;
