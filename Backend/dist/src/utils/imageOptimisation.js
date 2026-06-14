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
exports.createPlaceholder = exports.createThumbnail = exports.ImageOptimisation = void 0;
// src/utils/imageOptimisation.ts
const sharp_1 = __importDefault(require("sharp"));
/**
 * Optimizes an image for better performance and quality
 * @param file - The file from multer middleware
 * @param maxWidth - Maximum width constraint
 * @param maxHeight - Maximum height constraint
 * @param options - Additional optimization options
 * @returns Optimized file object with new buffer
 */
const ImageOptimisation = (file_1, maxWidth_1, maxHeight_1, ...args_1) => __awaiter(void 0, [file_1, maxWidth_1, maxHeight_1, ...args_1], void 0, function* (file, maxWidth, maxHeight, options = {}) {
    try {
        // Extract metadata to make intelligent decisions
        const metadata = yield (0, sharp_1.default)(file.buffer).metadata();
        // Preserve original format unless specified
        const originalFormat = metadata.format || "jpeg";
        const targetFormat = options.format || originalFormat;
        if (!metadata.width || !metadata.height) {
            throw new Error("Could not determine image dimensions");
        }
        // Log original size for debugging
        const originalSize = file.size;
        // Determine if the image needs resizing
        const shouldResize = (metadata.width > maxWidth || metadata.height > maxHeight) &&
            (maxWidth > 0 && maxHeight > 0);
        // Calculate aspect ratio
        const aspectRatio = metadata.width / metadata.height;
        // Build the sharp pipeline
        let pipeline = (0, sharp_1.default)(file.buffer);
        // Only resize if needed - preserve original dimensions for smaller images
        if (shouldResize) {
            pipeline = pipeline.resize({
                width: maxWidth,
                height: maxHeight,
                fit: options.fit || "inside", // Maintains aspect ratio
                background: options.background,
                withoutEnlargement: true, // Don't upscale small images
            });
        }
        // Set format-specific options
        switch (targetFormat) {
            case "jpeg":
                pipeline = pipeline.jpeg({
                    quality: options.quality || 85,
                    progressive: options.progressive !== false
                });
                break;
            case "png":
                pipeline = pipeline.png({
                    quality: options.quality || 85,
                    progressive: options.progressive !== false
                });
                break;
            case "webp":
                pipeline = pipeline.webp({
                    quality: options.quality || 85
                });
                break;
            case "avif":
                pipeline = pipeline.avif({
                    quality: options.quality || 80
                });
                break;
            default:
                // Fall back to original format with default options
                if (originalFormat === "jpeg") {
                    pipeline = pipeline.jpeg({ quality: options.quality || 85 });
                }
                else if (originalFormat === "png") {
                    pipeline = pipeline.png({ quality: options.quality || 85 });
                }
                else {
                    // Default to WebP for other formats
                    pipeline = pipeline.webp({ quality: options.quality || 85 });
                }
        }
        // Process the image
        const optimizedBuffer = yield pipeline.toBuffer();
        // Calculate compression ratio for possible logging
        const compressionRatio = originalSize / optimizedBuffer.length;
        // Log optimization results
        console.log(`Image optimized: ${file.originalname} - Original: ${originalSize} bytes, Optimized: ${optimizedBuffer.length} bytes, Ratio: ${compressionRatio.toFixed(2)}x`);
        // Return with updated buffer and size
        return Object.assign(Object.assign({}, file), { buffer: optimizedBuffer, size: optimizedBuffer.length });
    }
    catch (error) {
        console.error("Image optimization error:", error);
        // If optimization fails, return original file
        console.warn(`Falling back to original image for ${file.originalname}`);
        return file;
    }
});
exports.ImageOptimisation = ImageOptimisation;
/**
 * Creates an image thumbnail with specified dimensions
 * @param file - The file from multer middleware
 * @param width - Thumbnail width
 * @param height - Thumbnail height
 * @returns Optimized thumbnail file
 */
const createThumbnail = (file_1, ...args_1) => __awaiter(void 0, [file_1, ...args_1], void 0, function* (file, width = 200, height = 200) {
    try {
        const thumbnailBuffer = yield (0, sharp_1.default)(file.buffer)
            .resize({
            width,
            height,
            fit: "cover", // Cover is typically best for thumbnails
        })
            .webp({ quality: 80 }) // WebP is good for thumbnails
            .toBuffer();
        return Object.assign(Object.assign({}, file), { buffer: thumbnailBuffer, size: thumbnailBuffer.length, mimetype: "image/webp" });
    }
    catch (error) {
        console.error("Thumbnail creation error:", error);
        return file;
    }
});
exports.createThumbnail = createThumbnail;
/**
 * Creates a blurred placeholder image for lazy loading
 * @param file - The file from multer middleware
 * @returns Base64 encoded placeholder image string
 */
const createPlaceholder = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const placeholderBuffer = yield (0, sharp_1.default)(file.buffer)
            .resize(20) // Tiny thumbnail
            .blur(10) // Heavy blur
            .webp({ quality: 20 }) // Low quality is fine for placeholder
            .toBuffer();
        return `data:image/webp;base64,${placeholderBuffer.toString('base64')}`;
    }
    catch (error) {
        console.error("Placeholder creation error:", error);
        return "";
    }
});
exports.createPlaceholder = createPlaceholder;
exports.default = {
    ImageOptimisation: exports.ImageOptimisation,
    createThumbnail: exports.createThumbnail,
    createPlaceholder: exports.createPlaceholder,
};
