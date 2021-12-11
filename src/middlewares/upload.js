const multer = require('multer');
const path = require('path');

const maxfilesize = 1024 * 1024;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../vehicle-rental/src/media/images');
  },
  filename: (req, file, cb) => {
    console.log('[DB] req in upload: ', req.payload, file);
    const {payload} = req;
    id = payload.id;
    const fileName = `${file.fieldname}-${id}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, fileName);
  },
});

const multerOption = {
  storage,
  fileFilter: (req, file, cb) => {
    req.isPassFilter = true;
    console.log('[db] im inside filter');
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

module.exports = multer(multerOption);
