const express = require('express');
const testimonyRouter = express.Router();

const auth = require('../middlewares/authorize');
const controllerTestimony = require('../controllers/testimony');

testimonyRouter.get('/', controllerTestimony.getTestimony);
testimonyRouter.post(
  '/',
  auth.authorizeCustomer,
  controllerTestimony.addNewTestimony,
);
testimonyRouter.delete('/', controllerTestimony.deleteTestimony);

module.exports = testimonyRouter;
