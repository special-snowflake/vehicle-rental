const {config} = require('dotenv');
const multer = require('multer');
const path = require('path');

const maxfilesize = 2 * 1024 * 1024;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../vehicle-rental/media/vehicle-images/');
  },
  filename: (req, file, cb) => {
    const {
      body: {city, category},
    } = req;
    const fileName = `vhc-img-${city}-${category}-${Date.now()}${path.extname(
      file.originalname
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
      err.code = 'WRONG_EXSTENTION';
      return cb(err);
    }
  },
  limits: {fileSize: maxfilesize},
};

const getImagePath = (files) => {
  const imagePath = [];
  files.forEach((element) => {
    const path = `${element.destination}${element.filename}`;
    imagePath.push(path);
  });
  return imagePath;
};

const upload = multer(multerOption).array('images', 3);
const multerHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          errMsg: `Image size mustn't be bigger than 2MB!`,
          err: err.code,
        });
      }
      if (err.code === 'WRONG_EXSTENTION') {
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
    if (images.length === 0) {
      return res.status(400).json({errMsg: 'Please add an Image.'});
    }
    req.images = images;
    next();
  });
};

module.exports = multerHandler;
