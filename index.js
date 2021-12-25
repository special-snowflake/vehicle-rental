require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const app = express();
const router = require('./src/routers/main');
const bodyParser = require('body-parser');

const logger = morgan(
  ':method :url :status :res[content-length] - :response-time ms'
);

const port = 8000;
app.listen(port, () => {
  console.log(`Server is running in port : ${port}`);
});

const options = {
  dotfiles: 'ignore', // allow, deny, ignore
  etag: true,
  extensions: ['htm', 'html'],
  index: false, // to disable directory indexing
  maxAge: '7d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
  },
};

app.use(express.static('media', options));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(logger);
app.use(router);
