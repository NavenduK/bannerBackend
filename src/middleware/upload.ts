import multer, { StorageEngine } from 'multer';
import { Request } from 'express';

export interface FileRequest extends Request {
  file?: Express.Multer.File;
}

const storage: StorageEngine = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
