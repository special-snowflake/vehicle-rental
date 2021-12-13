const express = require('express');
const authRouter = express.Router();
const auth = require('../middlewares/authorize');
const upload = require('../middlewares/upload');

const authController = require('../controllers/auth');

authRouter.post('/', authController.login);
authRouter.post('/register', upload, authController.register);
authRouter.delete('/', auth.authorizeAllUser, authController.logout);

module.exports = authRouter;
