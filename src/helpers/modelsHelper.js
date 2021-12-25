const rejectOrResolve = (err, result, resolve, reject) => {
  if (err) {
    return reject(err);
  }
  resolve({status: 200, data: result});
};

module.exports = {rejectOrResolve};
