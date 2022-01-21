const multer = require('multer');
const path = require('path');

const maxfilesize = 2 * 1024 * 1024;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'media/vehicle-images/');
  },
  filename: (req, file, cb) => {
    let {
      body: {city, category},
    } = req;
    if (!city) city = 0;
    if (!category) category = 0;
    const fileName = `vhc-img-${city}-${category}-${Date.now()}${path.extname(
      file.originalname,
    )}`;
    cb(null, fileName);
  },
});

const multerOption = {
  storage,
  fileFilter: (req, file, cb) => {
    req.isPassFilter = true;
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error('Only .png, .jpg and .jpeg format allowed!');
      err.code = 'WRONG_EXSTENSION';
      return cb(err);
    }
  },
  limits: {fileSize: maxfilesize},
};

const getImagePath = (files) => {
  const imagePath = [];
  files.forEach((element) => {
    const path = `/vehicle-images/${element.filename}`;
    imagePath.push(path);
  });
  return imagePath;
};

const upload = multer(multerOption).array('images', 3);
const multerHandler = (req, res, next) => {
  upload(req, res, (err) => {
    console.log('[db] inside multer upload');
    if (err) {
      console.log('error found', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          errMsg: `Image size mustn't be bigger than 2MB!`,
          err: err.code,
        });
      }
      if (err.code === 'WRONG_EXSTENSION') {
        return res.status(400).json({
          errMsg: `Only .png, .jpg and .jpeg format allowed!`,
          err: err.code,
        });
      }
      return res.status(500).json({
        errMsg: `Something went wrong.`,
        err,
      });
    }
    const images = getImagePath(req.files);
    console.log('[db]umlter images', req.files);
    req.images = images;
    console.log('db req images', req.images);
    next();
  });
};

module.exports = multerHandler;
