const success = (res, status, data) => {
  res.status(status).json(data);
};

const error = (res, status, data) => {
  res.status(status).json(data);
};

module.exports = {success, error};
