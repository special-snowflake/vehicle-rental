const express = require('express');
const router = express.Router();

const homeRouter = require('./home');
const userRouter = require('./user');
const testimonyRouter = require('./testimony');
const historyRouter = require('./history');
const vehiclesRouter = require('./vehicles');
const categoryRouter = require('./category');
const cityRouter = require('./city');

router.use('/home', homeRouter);
router.use('/user', userRouter);
router.use('/testimony', testimonyRouter);
router.use('/history', historyRouter);
router.use('/vehicles', vehiclesRouter);
router.use('/category', categoryRouter);
router.use('/city', cityRouter);

router.get('/', (_req, res) => {
  res.redirect('home');
});


module.exports = router;

