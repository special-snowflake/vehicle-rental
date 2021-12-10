const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {
  const token = req.header('x-authorized-token');
  const jwtOptions = {
    issuer: process.env.ISSUER,
  };
  jwt.verify(token, process.env.SECRET_KEY, jwtOptions, (err, payload) => {
    if (err) {
      return res
        .status(403)
        .json({msg: 'You need to login to perform this action.'});
    }
    const {id, name} = payload;
    res.json({result: id, name});
  });
};
module.exports = {authorize};
