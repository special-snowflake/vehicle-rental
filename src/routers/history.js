const express = require('express');

const historyRouter = express.Router();

const controllerHistory = require('../controllers/history');
const middleHistory = require('../middlewares/history');

historyRouter.post(
  '/',
  middleHistory.checkInputHistory,
  middleHistory.getUserId,
  controllerHistory.addHistory
);

historyRouter.get('/', controllerHistory.getHistory);

historyRouter.patch(
  '/',
  middleHistory.getDataForUpdate,
  controllerHistory.updateHistory
);

historyRouter.delete(
  '/',
  middleHistory.getDataForDelete,
  controllerHistory.deleteHistory
);

module.exports = historyRouter;
