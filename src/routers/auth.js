const express = require('express');
const authRouter = express.Router();
const auth = require('../middlewares/authorize');

// const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const authController = require('../controllers/auth');

authRouter.post(
  '/register',
  validate.validateRegister,
  authController.register,
);
authRouter.get('/checktoken', auth.authorizeAllUser, authController.checkToken);
authRouter.post('/', validate.validateLogin, authController.login);
authRouter.delete('/', auth.authorizeAllUser, authController.logout);
module.exports = authRouter;
