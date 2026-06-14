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
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageProcessingMiddleware = void 0;
const imageOptimisation_1 = require("../utils/imageOptimisation");
const defaultOptions = {
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
const imageProcessingMiddleware = (options = {}) => {
    const settings = Object.assign(Object.assign({}, defaultOptions), options);
    return (req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const multerReq = req;
            // Process single file upload
            if (multerReq.file && multerReq.file.mimetype.startsWith("image/")) {
                multerReq.file = yield (0, imageOptimisation_1.ImageOptimisation)(multerReq.file, settings.maxWidth, settings.maxHeight, {
                    quality: settings.quality,
                });
                // Generate thumbnail if requested
                if (settings.generateThumbnail) {
                    const thumbnail = yield (0, imageOptimisation_1.createThumbnail)(multerReq.file, settings.thumbnailWidth, settings.thumbnailHeight);
                    // Attach thumbnail to request for later use
                    // This allows services to access the thumbnail
                    req.thumbnail = thumbnail;
                }
            }
            // Process multiple file uploads
            if (multerReq.files) {
                const files = multerReq.files;
                for (const fieldname in files) {
                    // Keep track of thumbnails if needed
                    const thumbnails = [];
                    for (let i = 0; i < files[fieldname].length; i++) {
                        if (files[fieldname][i].mimetype.startsWith("image/")) {
                            files[fieldname][i] = yield (0, imageOptimisation_1.ImageOptimisation)(files[fieldname][i], settings.maxWidth, settings.maxHeight, { quality: settings.quality });
                            if (settings.generateThumbnail) {
                                const thumbnail = yield (0, imageOptimisation_1.createThumbnail)(files[fieldname][i], settings.thumbnailWidth, settings.thumbnailHeight);
                                thumbnails.push(thumbnail);
                            }
                        }
                    }
                    // Attach thumbnails if any were generated
                    if (thumbnails.length > 0) {
                        req.thumbnails = Object.assign(Object.assign({}, (req.thumbnails || {})), { [fieldname]: thumbnails });
                    }
                }
            }
            next();
        }
        catch (error) {
            console.error("Image processing middleware error:", error);
            // Continue even if image processing fails
            next();
        }
    });
};
exports.imageProcessingMiddleware = imageProcessingMiddleware;
exports.default = exports.imageProcessingMiddleware;
