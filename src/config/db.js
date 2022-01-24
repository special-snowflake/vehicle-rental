const mysql = require('mysql2');
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB,
  // timezone: 'utc',
});

module.exports = db;
