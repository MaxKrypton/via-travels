import { Request } from "express";
import multer from "multer";

export interface MulterRequest extends Request {
  file?: Express.Multer.File;  // Add this for single file uploads

  files?: {
    [fieldname: string]: Express.Multer.File[];
  }
}

// Multer Storage
const storage = multer.memoryStorage();

// Initialize multer with the storage configuration
export const upload = multer({ storage });

