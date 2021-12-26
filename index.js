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
  ':method :url :status :res[content-length] - :response-time ms',
);

app.use('/vehicles', express.static(path.join(__dirname, 'media')));
app.use('/user', express.static(path.join(__dirname, 'media')));

const port = 8000;
app.listen(port, () => {
  console.log(`Server is running in port : ${port}`);
});

const whitelist = [
  'http://127.0.0.1:5500',
  'http://localhost:8000',
  'http://vehicle-rental.netlify.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  }),
);

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(logger);
app.use(router);
