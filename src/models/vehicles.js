const mysql = require('mysql');
const db = require('../config/db');
const modelHelp = require('../helpers/modelsHelper');
const checkVehicleUpdate = require('../helpers/checkVehicleUpdate');
const fs = require('fs');

const getVehicles = (category) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = ``;
    let msg = '';
    if (category.toLocaleLowerCase() === 'popular') {
      msg = 'Popular in Town:';
      sqlQuery = `
      SELECT h.vehicle_id, ct.city, c.category, v.brand,
      v.model, v.capacity, v.price
      FROM history h 
      LEFT join testimony t ON h.id = t.history_id 
      JOIN vehicles v ON v.id = h.vehicle_id
      JOIN city ct ON v.city_id = ct.id
      JOIN category c ON v.category_id = c.id
      GROUP BY h.vehicle_id 
      ORDER BY (0.5*avg(coalesce(t.rate,0))+(1-0.5)*count(h.vehicle_id)) DESC
      LIMIT 10`;
    }
    let keyword = ``;
    if (
      typeof category.toLocaleLowerCase() !== 'undefined' &&
      category.toLocaleLowerCase() !== 'popular'
    ) {
      keyword = category;
      msg = `Popular ${category}`;
      sqlQuery = `SELECT h.vehicle_id, ct.city, c.category, v.brand,
      v.model, v.capacity, v.price
      from history h 
      LEFT join testimony t ON h.id = t.history_id 
      JOIN vehicles v ON v.id = h.vehicle_id
      JOIN city ct ON v.city_id = ct.id
      JOIN category c ON v.category_id = c.id
      WHERE c.category = ?
      GROUP BY h.vehicle_id 
      ORDER BY (0.5*avg(coalesce(t.rate,0))+(1-0.5)*count(h.vehicle_id)) DESC
      LIMIT 10`;
    }
    db.query(sqlQuery, [keyword], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length == 0) {
        const errMsg = `Category can't be  found`;
        return resolve({status: 404, result: {errMsg}});
      }
      return resolve({
        status: 200,
        result: {msg, meta: {totalData: result.length}, data: result},
      });
    });
  });
};

const getDataForUpdate = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM vehicles WHERE id = ?`;
    db.query(sqlQuery, [id], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

const getDetailByID = (id) => {
  return new Promise((resolve, reject) => {
    const sqlGetImages = `SELECT image FROM vehicle_images WHERE vehicle_id=?`;
    db.query(sqlGetImages, [id], (err, result) => {
      if (err) return reject(err);
      const images = [];
      result.forEach((element) => {
        images.push(element.image);
      });
      console.log(images);
      const sqlQuery = `SELECT v.id, ct.category, v.brand, v.model,
      v.capacity, v.price, v.status, c.city  
      FROM vehicles v JOIN city c ON c.id = v.city_id 
      JOIN category ct ON ct.id = v.category_id 
      WHERE v.id = ?`;
      db.query(sqlQuery, [id], (err, result) => {
        if (err) return reject(err);
        result = {...result[0], ...{images}};
        return resolve({
          status: 200,
          result: {msg: `Detail Vehicle Id ${id}`, data: result},
        });
      });
    });
  });
};

const searchVehicles = (query) => {
  return new Promise((resolve, reject) => {
    let {
      cityId,
      categoryId,
      brand,
      model,
      minCapacity,
      orderBy,
      sort,
      limit,
      page,
    } = query;
    console.log(query);
    let nextPage = '/search?';
    let previousPage = '/search?';
    let offset = '';
    if (orderBy !== '' && typeof orderBy !== 'undefined') {
      if (typeof sort !== 'undefined') {
        sort = sort.toLocaleLowerCase() === 'desc' ? ' DESC' : ' ASC';
      } else {
        sort = ' ASC';
      }
    } else {
      orderBy = 'v.id';
      sort = ' ASC';
    }
    if (!limit) {
      limit = '5';
    }
    if (!page) {
      page = '1';
      offset = 0;
    } else {
      offset = (+page - 1) * +limit;
    }
    console.log('[db check after me]');
    nextPage += cityId == '' || !cityId ? `cityId=&` : `cityId=${cityId}&`;
    previousPage += cityId == '' || !cityId ? `cityId=&` : `cityId=${cityId}&`;
    cityId = cityId == '' || !cityId ? '%%' : `%${cityId}%`;

    nextPage +=
      categoryId == '' || !categoryId ?
        `categoryId=&` :
        `categoryId=${categoryId}&`;
    previousPage +=
      categoryId == '' || !categoryId ?
        `categoryId=&` :
        `categoryId=${categoryId}&`;
    categoryId = categoryId == '' || !categoryId ? '%%' : `%${categoryId}%`;

    nextPage += brand == '' || !brand ? `brand=&` : `brand=${brand}&`;
    previousPage += brand == '' || !brand ? `brand=&` : `brand=${brand}&`;
    brand = brand == '' || !brand ? '%%' : `%${brand}%`;

    nextPage += model == '' || !model ? `model=&` : `model=${model}&`;
    previousPage += model == '' || !model ? `model=&` : `model=${model}&`;
    model = model == '' || !model ? '%%' : `%${model}%`;

    nextPage +=
      minCapacity == '' || !minCapacity ?
        `minCapacity=` :
        `minCapacity=${minCapacity}`;
    previousPage +=
      minCapacity == '' || !minCapacity ?
        `minCapacity=` :
        `minCapacity=${minCapacity}`;
    minCapacity = minCapacity == '' || !minCapacity ? '1' : minCapacity;

    const prepare = [
      cityId,
      categoryId,
      brand,
      model,
      minCapacity,
      mysql.raw(orderBy),
      mysql.raw(sort),
      offset,
      mysql.raw(limit),
    ];
    const sqlCount = `SELECT count(*) count 
    FROM vehicles v JOIN city c ON v.city_id = c.id
    JOIN category ct ON v.category_id = ct.id
    WHERE v.city_id LIKE ? and v.category_id LIKE ? 
    and v.brand LIKE ? and v.model LIKE ? and v.capacity >= ? `;
    db.query(sqlCount, prepare, (err, result) => {
      if (err) reject(err);
      const count = result[0].count;
      const sortSpliced = sort.slice(1, sort.length);
      const nextOffset = +offset + +limit;
      const nPage = nextOffset > count ? null : +page + 1;
      const pPage = page > 1 ? +page - 1 : null;
      console.log(nextPage, previousPage);
      if (nPage == null) {
        nextPage = null;
      } else {
        nextPage +=
          '&orderBy=' +
          orderBy +
          '&sort=' +
          sortSpliced +
          '&limit=' +
          limit +
          '&page=' +
          nPage;
      }
      if (pPage == null) {
        previousPage = null;
      } else {
        previousPage +=
          '&orderBy=' +
          orderBy +
          '&sort=' +
          sortSpliced +
          '&limit=' +
          limit +
          '&page=' +
          nPage;
      }
      const meta = {
        totalData: count,
        previousPage,
        page,
        nextPage,
      };
      const sqlSearch = `SELECT v.id, v.model, v. brand, 
          v.stock, c.city, ct.category, v.price, v.capacity
          FROM vehicles v JOIN city c ON v.city_id = c.id
          JOIN category ct ON v.category_id = ct.id
          WHERE v.city_id LIKE ? and v.category_id LIKE ? 
          and v.brand LIKE ? and v.model LIKE ? and v.capacity >= ? 
          ORDER BY ? ?
          LIMIT ?, ?;`;
      db.query(sqlSearch, prepare, (err, result) => {
        if (err) return reject(err);
        return resolve({
          status: 200,
          result: {msg: 'Result search vehicle.', meta, data: result},
        });
      });
    });
  });
};

const updateVehicle = (req) => {
  console.log('[db] inside mdl vch upt');
  return new Promise((resolve, reject) => {
    console.log('[db] inside mdl vch upt promise');
    console.log('[db] req.body', req.body);
    const {
      body: {id},
    } = req;
    const newImages = req.images;
    const getImages = `SELECT image from vehicle_images WHERE id=? LIMIT ?`;
    const deleteImages = `DELETE FROM vehicle_images 
    WHERE vehicle_id = ? LIMIT ?`;
    const getOldData = `SELECT * FROM vehicles WHERE id = ?`;
    const sqlQuery = `
    UPDATE vehicles SET 
    category_id = ?,
    city_id = ?,
    brand = ?,
    model = ?,
    capacity = ?,
    price = ?,
    status = ?,
    stock = ?
    WHERE id = ?;`;
    db.query(getImages, [id, newImages.length], (err, result) => {
      console.log('[db] inside new images');
      if (err) {
        return reject(err);
      }
      const oldImages = [];
      result.forEach((element) => {
        oldImages.push(element);
      });
      db.query(deleteImages, [id, newImages.length], (err, result) => {
        console.log('[db] inside delete images');
        if (err) {
          return reject(err);
        }
        let values = `VALUES`;
        const prepareImages = [];
        let queryImages = 'SELECT id FROM vehicle_images WHERE id = 0';
        if (newImages.length !== 0) {
          newImages.forEach((element, index) => {
            if (index !== newImages.length - 1) {
              values += ` (?,?), `;
            } else {
              values += ` (?,?) `;
            }
            prepareImages.push(id, element);
            console.log(element);
          });
          queryImages = `INSERT INTO vehicle_images (vehicle_id, image) 
          ${values}`;
        }
        db.query(queryImages, prepareImages, (err, result) => {
          if (err) {
            return reject(err);
          }
          db.query(getOldData, [id], (err, result) => {
            if (err) {
              return reject(err);
            }
            console.log('[db] result', result);
            console.log('[db] body', req.body);
            const dataUpdate = checkVehicleUpdate(req.body, result[0]);
            console.log('new data', dataUpdate);
            db.query(sqlQuery, dataUpdate, (err, result) => {
              if (err) {
                return reject(err);
              }
              return resolve({
                status: 200,
                result: {
                  msg: 'Vehicle Updated.',
                  data: {
                    id,
                    categoryId: dataUpdate[0],
                    cityId: dataUpdate[1],
                    brand: dataUpdate[2],
                    model: dataUpdate[3],
                    capacity: dataUpdate[4],
                    price: dataUpdate[5],
                    status: dataUpdate[6],
                    stock: dataUpdate[7],
                    images: newImages,
                  },
                },
              });
            });
          });
        });
      });
    });
  });
};

const addNewVehicle = (req) => {
  return new Promise((resolve, reject) => {
    const {
      body: {brand, model, capacity, price, status, stock, category, city},
    } = req;
    const prepare = [
      category,
      city,
      brand,
      model,
      capacity,
      price,
      status,
      stock,
    ];
    const images = req.images;
    if (images.length === 0) {
      return resolve({status: 400, result: {errMsg: 'Please add an Image.'}});
    }
    const sqlQuery = `
    INSERT INTO vehicles 
    ( category_id, city_id, brand, model, capacity, price, status, stock) 
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?);`;
    db.query(sqlQuery, prepare, (err, result) => {
      if (err) {
        images.forEach((element) => {
          fs.unlink(
            `../vehicle-rental/media/vehicle-images/${element}`,
            (err) => {
              if (err) {
                return reject(err);
              }
            },
          );
        });
        return reject(err);
      }
      const id = result.insertId;
      let values = `VALUES`;
      const prepareImages = [];
      images.forEach((element, index) => {
        if (index !== images.length - 1) {
          values += ` (?,?), `;
        } else {
          values += ` (?,?) `;
        }
        prepareImages.push(id, element);
        console.log(element);
      });
      console.log('[db]model values, prepare', values, prepareImages);
      const queryImages = `INSERT INTO vehicle_images (vehicle_id, image) 
      ${values}`;
      db.query(queryImages, prepareImages, (err, result) => {
        if (err) {
          images.forEach((element) => {
            fs.unlink(
              `../vehicle-rental/media/vehicle-images/${element}`,
              (err) => {
                if (err) {
                  return reject(err);
                }
              },
            );
          });
          return reject(err);
        }
        return resolve({
          status: 200,
          result: {
            msg: 'New Vehicle Added.',
            data: {id, brand, model, capacity, price, status, stock, images},
          },
        });
      });
    });
  });
};

const deleteVehicle = (id) => {
  return new Promise((resolve, reject) => {
    const sqlGetImages = `SELECT image FROM vehicle_images WHERE vehicle_id=?`;
    db.query(sqlGetImages, [id], (err, result) => {
      if (err) return reject(err);
      const images = [];
      result.forEach((element) => {
        images.push(element);
      });
      const sqlDeleteImg = `DELETE FROM vehicle_images WHERE vehicle_id = ?`;
      db.query(sqlDeleteImg, [id], (err, result) => {
        if (err) return reject(err);
        const sqlQuery = `DELETE FROM vehicles where id = ?`;
        db.query(sqlQuery, [id], (err, result) => {
          console.log('[db]images:', images);
          if (err) return reject(err);
          if (images.length !== 0) {
            images.forEach((element) => {
              console.log('[db]element:', element);
              fs.unlink(`${element.image}`, (err) => {
                if (err) {
                  return reject(err);
                }
              });
            });
          }
          return resolve({
            status: 200,
            result: {msg: 'Vehicle deleted', data: {id}},
          });
        });
      });
    });
  });
};

const checkInputCategory = (category) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT id FROM category WHERE category = ?`;
    db.query(sqlQuery, [category], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

const checkInputCity = (city) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT id FROM city WHERE city = ?`;
    db.query(sqlQuery, [city], (err, result) => {
      modelHelp.rejectOrResolve(err, result, resolve, reject);
    });
  });
};

module.exports = {
  getVehicles,
  updateVehicle,
  addNewVehicle,
  deleteVehicle,
  checkInputCategory,
  checkInputCity,
  getDataForUpdate,
  getDetailByID,
  searchVehicles,
};
