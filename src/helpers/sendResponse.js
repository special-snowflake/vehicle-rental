const success = (res, status, data) => {
  res.status(status).json(data);
};

const error = (res, data) => {
  res.status(500).json(data);
};

module.exports = {success, error};
