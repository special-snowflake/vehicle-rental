const success = (res, status, data) => {
  return res.status(status).json(data);
};

const error = (res, status, data) => {
  return res.status(status).json(data);
};

module.exports = {success, error};
