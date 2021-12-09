const express = require('express');

const userRouter = express.Router();

const middleUser = require('../middlewares/user');
const controllerUser = require('../controllers/user');

userRouter.get('/:username', controllerUser.getUserByUnsername);

userRouter.get('/', controllerUser.getUserByName);

userRouter.post(
  '/',
  middleUser.checkUsername,
  middleUser.insertUser,
  controllerUser.insertUserAccess
);

userRouter.patch(
  '/',
  middleUser.getDataUserForUpdate,
  controllerUser.updateUser
);

userRouter.delete('/', controllerUser.deleteUser);

module.exports = userRouter;
