/* eslint-disable camelcase */
const mysql = require('mysql');
const db = require('../config/db');
const modelHelp = require('../helpers/modelsHelper');
const {getTimeStamp} = require('../helpers/collection.js');
// const checkVehicleUpdate = require('../helpers/checkVehicleUpdate');
const fs = require('fs');

const getVehicles = (category) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = ``;
    let msg = '';
    if (category.toLocaleLowerCase() === 'popular') {
      msg = 'Popular in Town:';
      sqlQuery = `
      SELECT h.vehicle_id id, ct.city, c.category,
      v.name, v.price, 
      (SELECT image FROM vehicle_images WHERE vehicle_id = h.vehicle_id 
        ORDER BY id DESC  LIMIT 1) as image
      FROM history h 
      LEFT JOIN testimony t ON h.id = t.history_id 
      JOIN vehicles v ON v.id = h.vehicle_id
      JOIN city ct ON v.city_id = ct.id
      JOIN category c ON v.category_id = c.id
      GROUP BY h.vehicle_id 
      ORDER BY (0.5*avg(coalesce(t.rate,0))+(1-0.5)*count(h.vehicle_id)) DESC`;
    }
    let keyword = ``;
    if (
      typeof category.toLocaleLowerCase() !== 'undefined' &&
      category.toLocaleLowerCase() !== 'popular'
    ) {
      keyword = category;
      msg = `Popular ${category}`;
      sqlQuery = `SELECT h.vehicle_id id, ct.city, c.category,
      v.name, v.price, 
      (SELECT image FROM vehicle_images 
        WHERE vehicle_id = h.vehicle_id ORDER BY id DESC LIMIT 1) as image
      from history h 
      LEFT join testimony t ON h.id = t.history_id 
      JOIN vehicles v ON v.id = h.vehicle_id
      JOIN city ct ON v.city_id = ct.id
      JOIN category c ON v.category_id = c.id
      WHERE c.category = ?
      GROUP BY h.vehicle_id 
      ORDER BY (0.5*avg(coalesce(t.rate,0))+(1-0.5)*count(h.vehicle_id)) DESC`;
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
    const sqlGetImages = `SELECT image FROM vehicle_images 
    WHERE vehicle_id=? ORDER BY id DESC`;
    db.query(sqlGetImages, [id], (err, result) => {
      if (err) return reject(err);
      const images = [];
      result.forEach((element) => {
        images.push(element.image);
      });
      console.log(images);
      const sqlQuery = `SELECT v.id, ct.category, c.city,
      v.name, v.category_id, v.city_id, v.user_id,
      v.description, v.price, v.status,  v.stock
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
    let {keyword, city, category, name, orderBy, sort, limit, page} = query;
    console.log(query);
    const priceMin = parseInt(query.priceMin) || 0;
    const priceMax = parseInt(query.priceMax) || 15 * 1000 * 1000;
    let nextPage = '?';
    let previousPage = '?';
    let offset = '';
    const orderByPage = orderBy;
    const sortPage = sort;
    nextPage += keyword == '' || !keyword ? `keyword=` : `keyword=${keyword}`;
    previousPage +=
      keyword == '' || !keyword ? `keyword=` : `keyword=${keyword}`;
    keyword = keyword == '' || !keyword ? '%%' : `%${keyword}%`;
    nextPage += `&priceMin=${priceMin}&priceMax=${priceMax}`;
    if (orderBy !== '' && typeof orderBy !== 'undefined') {
      if (sort) {
        sort = sort.toLocaleLowerCase() === 'desc' ? ' DESC' : ' ASC';
      } else {
        sort = ' ASC';
      }
      if (orderBy === 'price') {
        orderBy = 'v.price';
      }
      if (orderBy === 'city') {
        orderBy === 'c.city';
      }
      if (orderBy === 'name') {
        orderBy === 'v.name';
      }
    } else {
      orderBy = 'v.created_at';
    }
    if (!limit) {
      limit = '12';
    }
    if (!page) {
      page = '1';
      offset = 0;
    } else {
      offset = (+page - 1) * +limit;
    }
    console.log('[db check after me]');
    nextPage += city == '' || !city ? `` : `cityId=${city}&`;
    previousPage += city == '' || !city ? `` : `cityId=${city}&`;
    city = city == '' || !city ? '%%' : `%${city}%`;

    nextPage += category == '' || !category ? `` : `categoryId=${category}&`;
    previousPage +=
      category == '' || !category ? `` : `categoryId=${category}&`;
    category = category == '' || !category ? '%%' : `%${category}%`;

    nextPage += name == '' || !name ? `` : `name=${name}&`;
    previousPage += name == '' || !name ? `` : `name=${name}&`;
    name = name == '' || !name ? '%%' : `%${name}%`;

    // nextPage += model == '' || !model ? `model=&` : `model=${model}&`;
    // previousPage += model == '' || !model ? `model=&` : `model=${model}&`;
    // model = model == '' || !model ? '%%' : `%${model}%`;

    // nextPage +=
    //   minCapacity == '' || !minCapacity
    //     ? `minCapacity=`
    //     : `minCapacity=${minCapacity}`;
    // previousPage +=
    //   minCapacity == '' || !minCapacity
    //     ? `minCapacity=`
    //     : `minCapacity=${minCapacity}`;
    // minCapacity = minCapacity == '' || !minCapacity ? '1' : minCapacity;

    const prepare = [
      city,
      category,
      priceMin,
      priceMax,
      name,
      // brand,
      // model,
      // minCapacity,
      keyword,
      mysql.raw(orderBy),
      mysql.raw(sort),
      offset,
      mysql.raw(limit),
    ];
    const sqlCount = `SELECT count(*) count 
    FROM vehicles v 
    JOIN city c ON v.city_id = c.id
    JOIN category ct ON v.category_id = ct.id
    WHERE v.city_id LIKE ? and v.category_id LIKE ? 
    and v.price BETWEEN ? AND ?
    and v.name LIKE ? and concat(v.name, c.city, ct.category) LIKE ?`;
    console.log('sort', sort);
    db.query(sqlCount, prepare, (err, result) => {
      if (err) return reject(err);
      console.log(err);
      const count = result[0].count;
      // const sortSpliced = sort.slice(1, sort.length);
      const nextOffset = +offset + +limit;
      const nPage = nextOffset > count ? null : +page + 1;
      const pPage = page > 1 ? +page - 1 : null;
      const totalPage = Math.ceil(count / +limit);
      console.log(nextPage, previousPage);
      if (nPage == null) {
        nextPage = null;
      } else {
        if (typeof orderByPage !== 'undefined') {
          nextPage += '&orderBy=' + orderByPage;
        }
        if (typeof sortPage !== 'undefined') {
          nextPage += '&sort=' + sortPage;
        }
        nextPage += '&page=' + nPage;
      }
      if (pPage == null) {
        previousPage = null;
      } else {
        if (typeof orderByPage !== 'undefined') {
          previousPage += '&orderBy=' + orderByPage;
        }
        if (typeof sortPage !== 'undefined') {
          previousPage += '&sort=' + sortPage;
        }
        previousPage += '&page=' + pPage;
      }
      const meta = {
        totalData: count,
        previousPage,
        page,
        nextPage,
        totalPage,
      };
      const sqlSearch = `SELECT v.id, v.name, 
          v.stock, c.city, ct.category, v.price,
          (SELECT image FROM vehicle_images 
            WHERE vehicle_id = v.id ORDER BY id DESC LIMIT 1) 
          as image
          FROM vehicles v 
          JOIN city c ON v.city_id = c.id
          JOIN category ct ON v.category_id = ct.id 
          WHERE v.city_id LIKE ? and v.category_id LIKE ? 
          and v.price BETWEEN ? AND ?
          and v.name LIKE ? and concat(v.name, c.city, ct.category) LIKE ?
          ORDER BY ? ?
          LIMIT ?, ?;`;
      db.query(sqlSearch, prepare, (err, result) => {
        console.log(err);
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
  return new Promise((resolve, reject) => {
    const {params, images} = req;
    let {body} = req;
    const totalImages = images.length;
    const id = params.id;
    console.log('body:', body);
    console.log('param:', params);
    console.log('images:', images);
    const sqlUpdate = `UPDATE vehicles SET ? WHERE id = ?`;
    db.query(sqlUpdate, [body, id], (err, _result) => {
      if (err) {
        if (images.length !== 0) {
          deleteImages(images);
        }
        return reject(err);
      }
      if (images.length === 0) {
        return resolve({
          status: 200,
          result: {msg: 'Update vehicle success.', data: body},
        });
      }
      const sqlDeleteImages = `DELETE FROM vehicle_images
      WHERE vehicle_id = ? LIMIT ?`;
      db.query(sqlDeleteImages, [id, totalImages], (err, result) => {
        if (err) {
          if (images.length !== 0) {
            deleteImages(images);
          }
          return reject(err);
        }
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
        const queryImages = `INSERT INTO vehicle_images (vehicle_id, image) 
        ${values}`;
        db.query(queryImages, prepareImages, (err, result) => {
          if (err) {
            if (images.length !== 0) {
              deleteImages(images);
            }
            return reject(err);
          }
          body = {...body, ...{images: images}};
          return resolve({
            status: 200,
            result: {msg: 'Update vehicle success.', data: body},
          });
        });
      });
    });
  });
};

const addNewVehicle = (req) => {
  return new Promise((resolve, reject) => {
    let {body, payload} = req;
    const user_id = payload.id;
    console.log('payload', payload);
    console.log('body before', body);
    // const currentDate = new Date();
    // const timestamp = currentDate.getTime();
    const timeStamp = getTimeStamp();
    console.log('timestamp :', timeStamp);
    body = {
      ...body,
      ...{user_id},
      ...{created_at: timeStamp},
    };
    console.log('body after', body);
    const images = req.images;
    if (images.length === 0) {
      return resolve({status: 400, result: {errMsg: 'Please add an Image.'}});
    }
    const sqlQuery = `INSERT INTO vehicles SET ?`;
    db.query(sqlQuery, body, (err, result) => {
      if (err) {
        console.log(err);
        deleteImages(images);
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
          deleteImages(images);
          return reject(err);
        }
        // const id = result.insertId;
        body = {...{id}, ...body, ...{images}};
        return resolve({
          status: 200,
          result: {
            msg: 'New Vehicle Added.',
            data: body,
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
        images.push(element.image);
      });
      console.log(images);
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
              deleteImages(images);
            });
          }
          return resolve({
            status: 200,
            result: {msg: 'Vehicle deleted.', data: {id}},
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

const deleteImages = (images) => {
  images.forEach((element) => {
    fs.unlink(`media/${element}`, (err) => {
      if (err) {
        console.log(err);
        // return reject(err);
      }
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
