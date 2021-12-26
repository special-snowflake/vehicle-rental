const express = require('express');

const userRouter = express.Router();
const upload = require('../middlewares/upload');

const auth = require('../middlewares/authorize');
const middleUser = require('../middlewares/user');
const controllerUser = require('../controllers/user');

userRouter.get('/detail/:id', controllerUser.getUserById);
userRouter.get('/', controllerUser.getUserByName);

userRouter.patch(
  '/',
  auth.authorizeAllUser,
  upload,
  middleUser.getDataUserForUpdate,
  controllerUser.updateUser,
);

userRouter.delete('/', auth.authorizeAdmin, controllerUser.deleteUser);

module.exports = userRouter;
