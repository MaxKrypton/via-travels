// src/repository/File.upload.ts
import { SECRETS } from "../utils/helpers";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../utils/config/aws.config";
import { createThumbnail } from "../utils/imageOptimisation";
import path from "path";

class FileUpload {
  /**
   * Uploads a file to S3 bucket
   * @param file - The file to upload
   * @returns URL of the uploaded file or error message
   */
  async uploadFileToS3(file: Express.Multer.File): Promise<string | null> {
    if (!file) return null;

    try {
      const fileKey = `${Date.now()}-${this.sanitizeFilename(file.originalname)}`;

      const uploadParams = {
        Bucket: SECRETS.AWS_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      return `https://${SECRETS.AWS_BUCKET_NAME}.s3.${SECRETS.AWS_REGION}.amazonaws.com/${fileKey}`;
    } catch (error: any) {
      console.error("S3 upload error:", error);
      return error as string;
    }
  }

  /**
   * Uploads an image and its thumbnail to S3
   * @param file - The original image file
   * @returns Object containing URLs for both original and thumbnail
   */
  async uploadImageWithThumbnail(file: Express.Multer.File): Promise<{
    imageUrl: string | null,
    thumbnailUrl: string | null
  }> {
    if (!file || !file.mimetype.startsWith('image/')) {
      return { imageUrl: null, thumbnailUrl: null };
    }

    try {
      // Upload the original image
      const imageUrl = await this.uploadFileToS3(file);

      if (typeof imageUrl !== 'string') {
        throw new Error('Failed to upload original image');
      }

      // Create and upload thumbnail
      const thumbnail = await createThumbnail(file);
      const thumbnailKey = `thumbnails/${Date.now()}-thumb-${this.sanitizeFilename(file.originalname)}`;

      const thumbnailParams = {
        Bucket: SECRETS.AWS_BUCKET_NAME,
        Key: thumbnailKey,
        Body: thumbnail.buffer,
        ContentType: thumbnail.mimetype
      };

      await s3Client.send(new PutObjectCommand(thumbnailParams));
      const thumbnailUrl = `https://${SECRETS.AWS_BUCKET_NAME}.s3.${SECRETS.AWS_REGION}.amazonaws.com/${thumbnailKey}`;

      return { imageUrl, thumbnailUrl };
    } catch (error) {
      console.error("Error uploading image with thumbnail:", error);
      return { imageUrl: null, thumbnailUrl: null };
    }
  }

  /**
   * Uploads multiple files to S3
   * @param files - Array of files to upload
   * @returns Array of uploaded file URLs or null values for failed uploads
   */
  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<(string | null)[]> {
    const uploadPromises = files.map(file => this.uploadFileToS3(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Deletes a file from S3 bucket
   * @param fileUrl - The full URL of the file to delete
   * @returns True if deletion was successful
   */
  async deleteFileFromS3(fileUrl: string): Promise<boolean> {
    try {
      // Extract the key from the URL
      const urlObj = new URL(fileUrl);
      const key = urlObj.pathname.substring(1); // Remove leading slash

      const deleteParams = {
        Bucket: SECRETS.AWS_BUCKET_NAME,
        Key: key
      };

      await s3Client.send(new PutObjectCommand(deleteParams));
      return true;
    } catch (error) {
      console.error("S3 delete error:", error);
      return false;
    }
  }

  /**
   * Sanitizes a filename by removing unsafe characters
   * @param filename - Original filename
   * @returns Sanitized filename
   */
  private sanitizeFilename(filename: string): string {
    // Get file extension
    const ext = path.extname(filename);

    // Get base name without extension
    const baseName = path.basename(filename, ext);

    // Sanitize base name - remove special chars, replace spaces with hyphens
    const sanitized = baseName
      .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase();

    // Return sanitized name with extension
    return `${sanitized}${ext}`;
  }
}

export default new FileUpload();
