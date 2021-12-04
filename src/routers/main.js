const express = require('express');
const router = express.Router();

const testimonyRouter = require('./testimony');
const homeRouter = require('./home');
const userRouter = require('./user');
const vehiclesRouter = require('./vehicles');
const categoryRouter = require('./category');

router.use('/testimony', testimonyRouter);
router.use('/home', homeRouter);
router.use('/user', userRouter);
router.use('/vehicles', vehiclesRouter);
router.use('/category', categoryRouter);


router.get('/', (_req, res) => {
  res.redirect('home');
});


module.exports = router;

