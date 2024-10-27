import multer from 'multer';

// import path from 'path';
import { TMP_UPLOAD_DIR } from '../constants/index.js';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, TMP_UPLOAD_DIR);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + '-' + file.originalname);
//   },
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TMP_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}_${file.originalname}`);
  },
});
const upload = multer({ storage });

export default upload;
