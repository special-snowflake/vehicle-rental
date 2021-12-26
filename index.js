require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const app = express();
const cors = require('cors');
const router = require('./src/routers/main');
const bodyParser = require('body-parser');
const path = require('path');

const logger = morgan(
  ':method :url :status :res[content-length] - :response-time ms'
);

app.use('/vehicles', express.static(path.join(__dirname, 'media')));
app.use('/user', express.static(path.join(__dirname, 'media')));

const port = 8000;
app.listen(port, () => {
  console.log(`Server is running in port : ${port}`);
});

// const options = {
//   dotfiles: 'ignore', // allow, deny, ignore
//   etag: true,
//   extensions: ['htm', 'html'],
//   index: false, // to disable directory indexing
//   maxAge: '7d',
//   redirect: false,
//   setHeaders: function (res, path, stat) {
//     res.set('x-timestamp', Date.now());
//   },
// };
app.options('/*', (req, res) => {
  const corsHeader = {
    'Access-Control-Allow-Origin': 'http://localhost:8000',
    'Access-Control-Allow-Methods': [
      'GET',
      'POST',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    'Access-Control-Allow-Headers': 'x-authorized-token',
  };
  res.set(corsHeader);
  res.status(204);
});

console.log(__dirname);

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(logger);
app.use(router);
