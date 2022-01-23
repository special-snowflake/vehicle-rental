const express = require('express');

const authorize = require('../middlewares/authorize');
const historyRouter = express.Router();

const controllerHistory = require('../controllers/history');
const middleHistory = require('../middlewares/history');

historyRouter.post(
  '/',
  authorize.authorizeCustomer,
  controllerHistory.addHistory,
);

historyRouter.get('/', controllerHistory.getHistory);

historyRouter.get(
  '/search',
  authorize.authorizeAllUser,
  controllerHistory.searchHistory,
);
historyRouter.patch(
  '/',
  middleHistory.getDataForUpdate,
  controllerHistory.updateHistory,
);

historyRouter.delete(
  '/',
  authorize.authorizeAllUser,
  controllerHistory.deleteHistory,
);

module.exports = historyRouter;
