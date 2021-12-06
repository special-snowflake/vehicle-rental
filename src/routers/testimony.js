const express = require('express');

const controllerTestimony = require('../controllers/testimony');

const testimonyRouter = express.Router();

testimonyRouter.get('/', controllerTestimony.getTestimony);
testimonyRouter.post('/', controllerTestimony.addNewTestimony);

module.exports = testimonyRouter;
