const db = require('../config/db');

const categoryAddVerification = (req, res, next) => {
  const {
    body: {category},
  } = req;
  console.log(category);
  const sqlQuery = `SELECT * FROM category WHERE category = ?`;
  db.query(sqlQuery, [category], (err, result) => {
    if (err)
      return res.status(500).json({
        msg: 'Something went wrong',
        err,
      });
    if (result !== 0) {
      return res.status(409).json({
        msg: 'Same category already exist.',
      });
    } else {
      next();
    }
  });
};

module.exports = categoryAddVerification;
