const rejectOrResolve = (err, result, resolve, reject) => {
  if (err) {
    return reject(err);
  }
  resolve({status: 200, result});
};

module.exports = {rejectOrResolve};
