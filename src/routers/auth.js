const express = require('express');
const authRouter = express.Router();
const auth = require('../middlewares/authorize');

const authController = require('../controllers/auth');

authRouter.post('/', authController.login);
authRouter.post('/register', authController.register);
authRouter.delete('/', auth.authorizeAllUser, authController.logout);

module.exports = authRouter;
