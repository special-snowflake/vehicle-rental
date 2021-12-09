const express = require('express');
const authRouter = express.Router();

const authController = require('../controllers/auth');

authRouter.post('/');
authRouter.post('/register', authController.register);
authRouter.delete('/');

module.exports = authRouter;
