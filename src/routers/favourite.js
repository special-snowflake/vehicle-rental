const express = require('express');

const favRouter = express.Router();

const auth = require('../middlewares/authorize');
const middleFav = require('../controllers/favourite');

favRouter.get('/', auth.authorizeCustomer, middleFav.getFavourite);
favRouter.post('/', auth.authorizeCustomer, middleFav.addFovourite);
favRouter.delete('/:id', auth.authorizeCustomer, middleFav.deleteFavourite);

module.exports = favRouter;
