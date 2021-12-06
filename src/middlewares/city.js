const db = require('../config/db');

const addCityVerification = (req, res, next) => {
  const {
    body: {city},
  } = req;
  const sqlQuery = `SELECT * FROM city WHERE city = ?`;
  db.query(sqlQuery, [city], (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    if (result !== 0) {
      return res.status(409).json({
        msg: 'Same city already exist.',
      });
    } else {
      next();
    }
  });
};

module.exports = addCityVerification;