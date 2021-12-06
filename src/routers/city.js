const express = require('express');

const cityController = require('../controllers/city');
const cityAddVerification = require('../middlewares/city');

const cityRouter = express.Router();

cityRouter.post(
  '/',
  cityAddVerification,
  cityController.addcity
);

cityRouter.get('/', cityController.getcity);

cityRouter.patch('/', cityController.updatecity);

cityRouter.delete('/', cityController.deletecity);

module.exports = cityRouter;
