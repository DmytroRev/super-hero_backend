import multer from 'multer';
import fs from 'fs';

// import path from 'path';
import { TMP_UPLOAD_DIR } from '../constants/index.js';
if (!fs.existsSync(TMP_UPLOAD_DIR)) {
  fs.mkdirSync(TMP_UPLOAD_DIR, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

export default upload;
