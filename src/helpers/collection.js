const grabLocalYMD = (iso8601) => {
  const date = new Date(iso8601);
  const year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1;
  let dt = date.getUTCDate();
  dt = dt < 10 ? '0' + dt : dt;
  month = month < 10 ? '0' + month : month;
  return year + '-' + month + '-' + dt;
};

const calculateDays = (dateA, dateB) => {
  if (dateA === dateB) return 1;
  const date1 = new Date(dateA);
  const date2 = new Date(dateB);
  const diff = date2 - date1;
  return diff / (1000 * 3600 * 24) + 1;
};

const checkingPatchWithData = (array, dataTable, dataInput) => {
  if (
    array[0][dataTable] !== dataInput &&
    typeof dataInput !== 'undefined' &&
    dataInput !== ''
  ) {
    array[0] = {
      ...array[0],
      [dataTable]: dataInput,
    };
  }
  return array[0];
};

const checkingPatchDate = (array, dataTable, dataInput) => {
  if (
    grabLocalYMD(array[0][dataTable]) !== dataInput &&
    typeof dataInput !== 'undefined' &&
    dataInput !== ''
  ) {
    array[0] = {
      ...array[0],
      [dataTable]: dataInput,
    };
    return array[0];
  }
  array[0] = {
    ...array[0],
    [dataTable]: grabLocalYMD(array[0][dataTable]),
  };
  return array[0];
};

module.exports = {
  grabLocalYMD,
  calculateDays,
  checkingPatchWithData,
  checkingPatchDate,
};
