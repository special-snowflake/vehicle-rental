const express = require('express');

const userRouter = express.Router();

const middleUser = require('../middlewares/user');
const controllerUser = require('../controllers/user');

userRouter.post(
  '/',
  middleUser.checkUsername,
  middleUser.insertUser,
  controllerUser.insertUserAccess
);

userRouter.get('/:username', controllerUser.getUserByUnsername);

userRouter.patch(
  '/',
  middleUser.getDataUserForUpdate,
  controllerUser.updateUser
);

module.exports = userRouter;
