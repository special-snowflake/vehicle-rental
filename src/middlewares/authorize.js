const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {
  const token = req.header('x-authorized-token');
  //   req.get('x-authorized-token');
  //   console.log('Token: ', token);
  const jwtOptions = {
    issuer: process.env.ISSUER,
  };
  jwt.verify(token, process.env.SECRET_KEY, jwtOptions, (err, payload) => {
    if (err) {
      return res
        .status(403)
        .json({msg: 'You dont have access to perform this action.'});
    }
    const {id, name} = payload;
    res.json({result: id, name});

    //   next();
  });
};
module.exports = {authorize};
