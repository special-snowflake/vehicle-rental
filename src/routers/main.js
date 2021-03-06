const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const homeRouter = require('./home');
const userRouter = require('./user');
const testimonyRouter = require('./testimony');
const historyRouter = require('./history');
const vehiclesRouter = require('./vehicles');
const categoryRouter = require('./category');
const cityRouter = require('./city');
const favRouter = require('./favourite');

router.use('/auth', authRouter);
router.use('/home', homeRouter);
router.use('/user', userRouter);
router.use('/testimony', testimonyRouter);
router.use('/history', historyRouter);
router.use('/vehicles', vehiclesRouter);
router.use('/category', categoryRouter);
router.use('/city', cityRouter);
router.use('/favourite', favRouter);

router.get('/', (_req, res) => {
  res.redirect('home');
});

module.exports = router;
