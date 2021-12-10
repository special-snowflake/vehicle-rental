const express = require('express');

const userRouter = express.Router();

const middleUser = require('../middlewares/user');
const controllerUser = require('../controllers/user');
const auth = require('../middlewares/authorize');

userRouter.get('/:username', controllerUser.getUserByUnsername);

userRouter.get('/', controllerUser.getUserByName);

userRouter.patch(
  '/',
  auth.authorizeAllUser,
  middleUser.getDataUserForUpdate,
  controllerUser.updateUser
);

userRouter.delete('/', auth.authorizeAdmin, controllerUser.deleteUser);

module.exports = userRouter;
