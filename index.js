require('dotenv').config();

const {grabLocalYMD} = require('./collection');

const express = require('express');

const morgan = require('morgan');

// const db = require('./src/config/db');

const app = express();

const logger = morgan(
  ':method :url :status :res[content-length] - :response-time ms'
);

const mysql = require('mysql');
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB,
  timezone: 'utc',
});
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running in port : ${port}`);
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(logger);

app.get('/', (_request, response, _next) => {
  response.redirect('home');
});

app.get('/home', (_request, response, _next) => {
  response.status(200).send(`<a href='vehicles'>Vehicles</a><br>
  <a href='/popular'>Popular</a><br>
  <a href='/profile'>Profile</a><br>
  <a href='/testimony'>Testimony</a>`);
});

app.get('/vehicles', (req, res, _next) => {
  const {query} = req;
  let keyword = '%%';
  if (query.type) keyword = `%${query.type}%`;
  const sqlQuery = `SELECT * FROM vehicles WHERE type LIKE "${keyword}"`;
  db.query(sqlQuery, (err, result) => {
    if (err) {
      return res.status(500).json({msg: 'Error Found', err, keyword});
    }
    return res.status(200).json({
      result,
      keyword,
    });
  });
});

app.post('/testimony', (req, res, _next) => {
  const {
    body: {historyId, rate, testimony},
  } = req;
  const date = grabLocalYMD(new Date());
  console.log(date);
  const sqlQuery = `INSERT INTO testimony (id, history_id, rate, testimony, date_added) 
  VALUES (0, "${historyId}", "${rate}", "${testimony}", "${date}")`;
  db.query(sqlQuery, (err, result) => {
    if (err) return res.status(500).json({msg: 'Something went wrong', err});
    return res.status(201).json({
      msg: 'Data successfully submitted',
      result: {
        historyId,
        rate,
        testimony,
        id: result.insertId,
      },
    });
  });
});

app.get('/testimony', (req, res, _next) => {
  let order = '';
  if (req.query.orderBy) {
    const orderBy = req.query.orderBy;
    console.log(orderBy);
    order =
      orderBy == 'date'
        ? ' ORDER BY testimony.date_added '
        : orderBy == 'rate'
        ? ' ORDER BY testimony.rate '
        : '';
  }
  let sort = '';
  if (req.query.sort) {
    sort = req.query.sort == 'desc' ? 'DESC' : 'ASC';
  }
  const sqlQuery = `SELECT testimony.id testiID, testimony.history_id historyID,
  testimony.rate, history.rental_date, history.return_date, testimony.testimony 
  FROM testimony JOIN history ON testimony.history_id = history.id`;
  console.log(order, 'here');
  db.query(sqlQuery + order + sort, (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: 'Data cannot be retrieved',
        err,
      });
    }
    if (result.length == 0) {
      return res.status(404).json({
        mgs: 'Data cannot be found',
      });
    }
    return res.status(200).json({
      msg: 'Testimony',
      result,
    });
  });
});

app.post('/users', (req, res, _next) => {
  const {
    body: {
      firstName,
      lastName,
      birthDate,
      sex,
      email,
      phone,
      address,
      joinDate,
    },
  } = req;
  const sql = `INSERT INTO users (
      id, 
      first_name, 
      last_name, 
      birth_date, 
      sex,
      email,
      phone,
      address,
      join_date) 
      VALUES (
      0, 
      '${firstName}',
      '${lastName}',
      '${birthDate}',
      '${sex}',
      '${email}',
      '${phone}',
      '${address}',
      '${joinDate}');`;
  db.query(sql, (err, result) => {
    if (err) return result.status(500).json({msg: 'Something went wrong', err});
    return res.status(201).json({
      msg: 'A New User Successfully Added',
      result: {
        fullName: `${firstName} ${lastName}`,
        sex: `${sex}`,
        birthDate: `${birthDate}`,
        id: result.insertId,
      },
    });
  });
});

app.get('/user/:username', (req, res) => {
  const {params} = req;
  const username = params.username;
  const sqlQuery = `SELECT 
  a.username, 
  u.first_name, 
  u.last_name, 
  u.birth_date, 
  u.sex, 
  u.email, 
  u.email, 
  u.address, 
  u.join_date 
  FROM 
  user_access a JOIN 
  users u ON a.user_id = u.id
  WHERE a.username = ? `;
  db.query(sqlQuery, [username], (err, result) => {
    if (err) return res.status(500).json({msg: 'Something went wrong', err});
    if (result.length == 0) {
      return res.status(404).json({msg: `User can't be found`});
    }
    const birth_date = result[0].birth_date,
      join_date = result[0].join_date;
    const sex =
      result[0].sex == 'M' ? 'Male' : result[0].sex == 'F' ? 'Female' : '';
    let searchResult = result;
    searchResult = {
      ...searchResult[0],
      birth_date: grabLocalYMD(birth_date),
      join_date: grabLocalYMD(join_date),
      sex,
    };
    return res.status(200).json(searchResult);
  });
});