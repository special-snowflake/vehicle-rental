const express = require('express');
const mysql = require('mysql');

const cityRouter = express.Router();
const db = require('../config/db');

const controllerCity = require('../controllers/city');
const addCityVerification = require('../middlewares/city');

cityRouter.post('/', addCityVerification, controllerCity.addNewCity);

cityRouter.get('/', controllerCity.getCity);

cityRouter.patch('/', controllerCity.updateCity);

cityRouter.delete('/', controllerCity.deleteCity);

module.exports = cityRouter;
