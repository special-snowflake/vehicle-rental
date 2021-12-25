const express = require('express');

const controllerTestimony = require('../controllers/testimony');

const testimonyRouter = express.Router();

testimonyRouter.get('/', controllerTestimony.getTestimony);
testimonyRouter.post('/', controllerTestimony.addNewTestimony);
testimonyRouter.delete('/', controllerTestimony.deleteTestimony);

module.exports = testimonyRouter;
