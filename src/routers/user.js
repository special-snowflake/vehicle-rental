const express = require('express');

const userRouter = express.Router();
const upload = require('../middlewares/upload');

const auth = require('../middlewares/authorize');
const middleUser = require('../middlewares/user');
const controllerUser = require('../controllers/user');

userRouter.get('/:username', controllerUser.getUserByUnsername);
userRouter.get('/', controllerUser.getUserByName);

userRouter.post(
  '/photo',
  auth.authorizeAllUser,
  upload.single('profilePicture'),
  controllerUser.uploadProfilePicture
);

userRouter.patch(
  '/photo',
  auth.authorizeAllUser,
  upload.single('profilePicture'),
  controllerUser.updateProfilePicture
);

userRouter.patch(
  '/',
  auth.authorizeAllUser,
  middleUser.getDataUserForUpdate,
  controllerUser.updateUser
);

userRouter.delete('/', auth.authorizeAdmin, controllerUser.deleteUser);

module.exports = userRouter;
