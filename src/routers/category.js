const express = require('express');

const categoryController = require('../controllers/category');
const categoryAddVerification = require('../middlewares/category');

const categoryRouter = express.Router();

categoryRouter.post(
  '/',
  categoryAddVerification,
  categoryController.addCategory
);

categoryRouter.get('/', categoryController.getCategory);

categoryRouter.patch('/', categoryController.updateCategory);

categoryRouter.delete('/', categoryController.deleteCategory);

module.exports = categoryRouter;
