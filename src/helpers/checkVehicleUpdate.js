const checkVehicleUpdate = (body, oldData) => {
  const {id, category, city, name, capacity, price, status, stock} =
    body;
  const dataUpdate = [];
  if (category !== '' && category) {
    dataUpdate.push(category);
  } else {
    dataUpdate.push(oldData.category_id);
  }

  if (city !== '' && city) {
    dataUpdate.push(city);
  } else {
    dataUpdate.push(oldData.city_id);
  }

  if (name !== '' && name) {
    dataUpdate.push(name);
  } else {
    dataUpdate.push(oldData.name);
  }

  // if (model !== '' && model) {
  //   dataUpdate.push(model);
  // } else {
  //   dataUpdate.push(oldData.model);
  // }

  if (capacity !== '' && capacity) {
    dataUpdate.push(capacity);
  } else {
    dataUpdate.push(oldData.capacity);
  }

  if (price !== '' && price) {
    dataUpdate.push(price);
  } else {
    dataUpdate.push(oldData.price);
  }

  if (status !== '' && status) {
    dataUpdate.push(status);
  } else {
    dataUpdate.push(oldData.status);
  }

  if (stock !== '' && stock) {
    dataUpdate.push(stock);
  } else {
    dataUpdate.push(oldData.stock);
  }

  dataUpdate.push(id);
  return dataUpdate;
};

module.exports = checkVehicleUpdate;
