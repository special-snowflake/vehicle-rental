const multer = require('multer');
const path = require('path');

const maxfilesize = 2 * 1024 * 1024;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../vehicle-rental/src/media/images');
  },
  filename: (req, file, cb) => {
    const fileName = `${file.fieldname}-${Date.now()}${path.extname(
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
      return cb((req.isPassFilter = false));
    }
  },
  limits: {fileSize: maxfilesize},
};

const upload = multer(multerOption).single('profilePicture');

const multerHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(500)
        .json({errorMsg: `Image size mustn't be bigger than 2MB.`});
    }
    next();
  });
};

module.exports = multerHandler;
