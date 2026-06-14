"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/repository/File.upload.ts
const helpers_1 = require("../utils/helpers");
const client_s3_1 = require("@aws-sdk/client-s3");
const aws_config_1 = require("../utils/config/aws.config");
const imageOptimisation_1 = require("../utils/imageOptimisation");
const path_1 = __importDefault(require("path"));
class FileUpload {
    /**
     * Uploads a file to S3 bucket
     * @param file - The file to upload
     * @returns URL of the uploaded file or error message
     */
    uploadFileToS3(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!file)
                return null;
            try {
                const fileKey = `${Date.now()}-${this.sanitizeFilename(file.originalname)}`;
                const uploadParams = {
                    Bucket: helpers_1.SECRETS.AWS_BUCKET_NAME,
                    Key: fileKey,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };
                yield aws_config_1.s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
                return `https://${helpers_1.SECRETS.AWS_BUCKET_NAME}.s3.${helpers_1.SECRETS.AWS_REGION}.amazonaws.com/${fileKey}`;
            }
            catch (error) {
                console.error("S3 upload error:", error);
                return error;
            }
        });
    }
    /**
     * Uploads an image and its thumbnail to S3
     * @param file - The original image file
     * @returns Object containing URLs for both original and thumbnail
     */
    uploadImageWithThumbnail(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!file || !file.mimetype.startsWith('image/')) {
                return { imageUrl: null, thumbnailUrl: null };
            }
            try {
                // Upload the original image
                const imageUrl = yield this.uploadFileToS3(file);
                if (typeof imageUrl !== 'string') {
                    throw new Error('Failed to upload original image');
                }
                // Create and upload thumbnail
                const thumbnail = yield (0, imageOptimisation_1.createThumbnail)(file);
                const thumbnailKey = `thumbnails/${Date.now()}-thumb-${this.sanitizeFilename(file.originalname)}`;
                const thumbnailParams = {
                    Bucket: helpers_1.SECRETS.AWS_BUCKET_NAME,
                    Key: thumbnailKey,
                    Body: thumbnail.buffer,
                    ContentType: thumbnail.mimetype
                };
                yield aws_config_1.s3Client.send(new client_s3_1.PutObjectCommand(thumbnailParams));
                const thumbnailUrl = `https://${helpers_1.SECRETS.AWS_BUCKET_NAME}.s3.${helpers_1.SECRETS.AWS_REGION}.amazonaws.com/${thumbnailKey}`;
                return { imageUrl, thumbnailUrl };
            }
            catch (error) {
                console.error("Error uploading image with thumbnail:", error);
                return { imageUrl: null, thumbnailUrl: null };
            }
        });
    }
    /**
     * Uploads multiple files to S3
     * @param files - Array of files to upload
     * @returns Array of uploaded file URLs or null values for failed uploads
     */
    uploadMultipleFiles(files) {
        return __awaiter(this, void 0, void 0, function* () {
            const uploadPromises = files.map(file => this.uploadFileToS3(file));
            return Promise.all(uploadPromises);
        });
    }
    /**
     * Deletes a file from S3 bucket
     * @param fileUrl - The full URL of the file to delete
     * @returns True if deletion was successful
     */
    deleteFileFromS3(fileUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Extract the key from the URL
                const urlObj = new URL(fileUrl);
                const key = urlObj.pathname.substring(1); // Remove leading slash
                const deleteParams = {
                    Bucket: helpers_1.SECRETS.AWS_BUCKET_NAME,
                    Key: key
                };
                yield aws_config_1.s3Client.send(new client_s3_1.PutObjectCommand(deleteParams));
                return true;
            }
            catch (error) {
                console.error("S3 delete error:", error);
                return false;
            }
        });
    }
    /**
     * Sanitizes a filename by removing unsafe characters
     * @param filename - Original filename
     * @returns Sanitized filename
     */
    sanitizeFilename(filename) {
        // Get file extension
        const ext = path_1.default.extname(filename);
        // Get base name without extension
        const baseName = path_1.default.basename(filename, ext);
        // Sanitize base name - remove special chars, replace spaces with hyphens
        const sanitized = baseName
            .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .toLowerCase();
        // Return sanitized name with extension
        return `${sanitized}${ext}`;
    }
}
exports.default = new FileUpload();
