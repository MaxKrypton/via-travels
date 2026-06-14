// src/middleware/imageProcessingMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { ImageOptimisation, createThumbnail } from "../utils/imageOptimisation";
import { MulterRequest } from "../utils/config/multer";

interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

const defaultOptions: ImageProcessingOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 85,
  generateThumbnail: false,
  thumbnailWidth: 200,
  thumbnailHeight: 200,
};

/**
 * Middleware to automatically process images before they're uploaded to S3
 * @param options - Image processing options
 */
export const imageProcessingMiddleware = (options: ImageProcessingOptions = {}) => {
  const settings = { ...defaultOptions, ...options };

  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      const multerReq = req as MulterRequest;

      // Process single file upload
      if (multerReq.file && multerReq.file.mimetype.startsWith("image/")) {
        multerReq.file = await ImageOptimisation(
          multerReq.file,
          settings.maxWidth!,
          settings.maxHeight!,
          {
            quality: settings.quality,
           }
        );

        // Generate thumbnail if requested
        if (settings.generateThumbnail) {
          const thumbnail = await createThumbnail(
            multerReq.file,
            settings.thumbnailWidth,
            settings.thumbnailHeight
          );

          // Attach thumbnail to request for later use
          // This allows services to access the thumbnail
          (req as any).thumbnail = thumbnail;
        }
      }

      // Process multiple file uploads
      if (multerReq.files) {
        const files = multerReq.files as { [fieldname: string]: Express.Multer.File[] };

        for (const fieldname in files) {
          // Keep track of thumbnails if needed
          const thumbnails: Express.Multer.File[] = [];

          for (let i = 0; i < files[fieldname].length; i++) {
            if (files[fieldname][i].mimetype.startsWith("image/")) {
              files[fieldname][i] = await ImageOptimisation(
                files[fieldname][i],
                settings.maxWidth!,
                settings.maxHeight!,
                { quality: settings.quality }
              );

              if (settings.generateThumbnail) {
                const thumbnail = await createThumbnail(
                  files[fieldname][i],
                  settings.thumbnailWidth,
                  settings.thumbnailHeight
                );
                thumbnails.push(thumbnail);
              }
            }
          }

          // Attach thumbnails if any were generated
          if (thumbnails.length > 0) {
            (req as any).thumbnails = {
              ...((req as any).thumbnails || {}),
              [fieldname]: thumbnails,
            };
          }
        }
      }

      next();
    } catch (error) {
      console.error("Image processing middleware error:", error);
      // Continue even if image processing fails
      next();
    }
  };
};

export default imageProcessingMiddleware;
