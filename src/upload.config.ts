import { extname } from 'path';
import { diskStorage } from 'multer';
import { MulterError } from 'multer';

export class UploadService {
  static fileFilter(req, file, cb) {
    const allowedTypes = /pdf|jpg|jpeg|png|xlsx|docs/;
    const ext = extname(file.originalname).toLowerCase();

    if (!allowedTypes.test(ext)) {
      // Trigger an error that can be caught in controller
      return cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'Pdf,Jpg,Jpeg,Png,xlsx and docs is allowed only'), false);
    }

    cb(null, true);
  }

  static storage = diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

  static limits = {
    fileSize: 2 * 1024 * 1024, // 2MB
  };
}
