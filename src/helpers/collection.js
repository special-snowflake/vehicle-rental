const grabLocalYMD = (iso8601) => {
  const date = new Date(iso8601);
  const year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1;
  let dt = date.getUTCDate();
  dt = dt < 10 ? '0' + dt : dt;
  month = month < 10 ? '0' + month : month;
  return year + '-' + month + '-' + dt;
};


module.exports = {
  grabLocalYMD,
};
