require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const app = express();
const router = require('./src/routers/main');

const logger = morgan(
  ':method :url :status :res[content-length] - :response-time ms'
);

const port = 8000;
app.listen(port, () => {
  console.log(`Server is running in port : ${port}`);
});

app.use(helmet());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(logger);
app.use(router);
