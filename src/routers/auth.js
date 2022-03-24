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
authRouter.post('/get-otp', authController.getOTP);
authRouter.post('/check-otp', authController.checkOTP);
authRouter.post('/reset-password', authController.resetPassword);

module.exports = authRouter;
