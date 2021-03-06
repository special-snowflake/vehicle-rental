const categoryModel = require('../models/category');
const sendResponse = require('../helpers/sendResponse');

const addCategory = (req, res) => {
  const {
    body: {category},
  } = req;
  categoryModel
    .modelAddCategory(category)
    .then(({status, result}) => {
      sendResponse.success(res, status, {
        msg: 'New Category Added',
        data: {
          id: result.insertId,
          category,
        },
      });
    })
    .catch((err) => {
      sendResponse.error(res, 500, {errMsg: 'Adding category failed.', err});
    });
};

const getCategory = (req, res) => {
  const {query} = req;
  const filter = query.filter == undefined ? '' : query.filter;
  categoryModel
    .modelGetCategory(filter)
    .then(({status, result}) => {
      if (status == 204) {
        sendResponse.success(res, status, {
          msg: 'Category is empty.',
          data: '',
        });
      }
      sendResponse.success(res, status, {
        msg: 'Category',
        meta: {totalData: result.length},
        data: result,
      });
    })
    .catch((err) =>
      sendResponse.error(res, 500, {errMsg: 'Something went wrong.', err})
    );
};

const updateCategory = (req, res) => {
  categoryModel
    .modelUpdateCategory(req.body.category, req.body.id)
    .then(({status}) => {
      sendResponse.success(res, status, {
        msg: 'Data successfully updated',
        data: {
          category: req.body.category,
          id: req.body.id,
        },
      });
    })
    .catch((err) => {
      sendResponse.error(res, 500, {
        errMsg: 'Something went wrong',
        err,
      });
    });
};

const deleteCategory = (req, res) => {
  const id = req.body.id;
  categoryModel
    .modelDeleteCategory(id)
    .then(({status, result}) => {
      return sendResponse.success(res, status, {
        msg: 'Category deteled.',
        data: {id},
      });
    })
    .catch((err) => {
      sendResponse.error(res, 500, {
        errMsg: 'Something when wrong',
        err,
      });
    });
};

module.exports = {addCategory, updateCategory, deleteCategory, getCategory};
