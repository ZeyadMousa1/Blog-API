import path from 'path';
import multer from 'multer';

// photo stprage
const photoStorage = multer.diskStorage({
   destination: function (req: any, file: any, cb: any) {
      cb(null, path.join(__dirname, '../images'));
   },
   filename: function (req, file, cb) {
      if (file) {
         cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
      } else {
         cb(null, 'Error');
      }
   },
});

// photo upload middelware
export const photoUpload = multer({
   storage: photoStorage,
   fileFilter: function (req: any, file: any, cb: any) {
      if (file.mimetype.startsWith('image')) {
         cb(null, true);
      } else {
         cb(new Error('Unsupported file format'), false);
      }
   },
   limits: { fieldSize: 1024 * 1024 },
});
