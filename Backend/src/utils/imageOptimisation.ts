// src/utils/imageOptimisation.ts
import sharp from "sharp";

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp" | "avif";
  fit?: keyof sharp.FitEnum;
  background?: string;
  progressive?: boolean;
}

/**
 * Optimizes an image for better performance and quality
 * @param file - The file from multer middleware
 * @param maxWidth - Maximum width constraint
 * @param maxHeight - Maximum height constraint
 * @param options - Additional optimization options
 * @returns Optimized file object with new buffer
 */
export const ImageOptimisation = async (
  file: Express.Multer.File,
  maxWidth: number,
  maxHeight: number,
  options: Partial<ImageOptimizationOptions> = {}
) => {
  try {
    // Extract metadata to make intelligent decisions
    const metadata = await sharp(file.buffer).metadata();

    // Preserve original format unless specified
    const originalFormat = metadata.format || "jpeg";
    const targetFormat = options.format || originalFormat;

    if (!metadata.width || !metadata.height) {
      throw new Error("Could not determine image dimensions");
    }

    // Log original size for debugging
    const originalSize = file.size;

    // Determine if the image needs resizing
    const shouldResize =
      (metadata.width > maxWidth || metadata.height > maxHeight) &&
      (maxWidth > 0 && maxHeight > 0);

    // Calculate aspect ratio
    const aspectRatio = metadata.width / metadata.height;

    // Build the sharp pipeline
    let pipeline = sharp(file.buffer);

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
        } else if (originalFormat === "png") {
          pipeline = pipeline.png({ quality: options.quality || 85 });
        } else {
          // Default to WebP for other formats
          pipeline = pipeline.webp({ quality: options.quality || 85 });
        }
    }

    // Process the image
    const optimizedBuffer = await pipeline.toBuffer();

    // Calculate compression ratio for possible logging
    const compressionRatio = originalSize / optimizedBuffer.length;

    // Log optimization results
    console.log(`Image optimized: ${file.originalname} - Original: ${originalSize} bytes, Optimized: ${optimizedBuffer.length} bytes, Ratio: ${compressionRatio.toFixed(2)}x`);

    // Return with updated buffer and size
    return {
      ...file,
      buffer: optimizedBuffer,
      size: optimizedBuffer.length,
    };
  } catch (error) {
    console.error("Image optimization error:", error);
    // If optimization fails, return original file
    console.warn(`Falling back to original image for ${file.originalname}`);
    return file;
  }
};

/**
 * Creates an image thumbnail with specified dimensions
 * @param file - The file from multer middleware
 * @param width - Thumbnail width
 * @param height - Thumbnail height
 * @returns Optimized thumbnail file
 */
export const createThumbnail = async (
  file: Express.Multer.File,
  width: number = 200,
  height: number = 200
) => {
  try {
    const thumbnailBuffer = await sharp(file.buffer)
      .resize({
        width,
        height,
        fit: "cover", // Cover is typically best for thumbnails
      })
      .webp({ quality: 80 }) // WebP is good for thumbnails
      .toBuffer();

    return {
      ...file,
      buffer: thumbnailBuffer,
      size: thumbnailBuffer.length,
      mimetype: "image/webp",
    };
  } catch (error) {
    console.error("Thumbnail creation error:", error);
    return file;
  }
};

/**
 * Creates a blurred placeholder image for lazy loading
 * @param file - The file from multer middleware
 * @returns Base64 encoded placeholder image string
 */
export const createPlaceholder = async (file: Express.Multer.File): Promise<string> => {
  try {
    const placeholderBuffer = await sharp(file.buffer)
      .resize(20) // Tiny thumbnail
      .blur(10) // Heavy blur
      .webp({ quality: 20 }) // Low quality is fine for placeholder
      .toBuffer();

    return `data:image/webp;base64,${placeholderBuffer.toString('base64')}`;
  } catch (error) {
    console.error("Placeholder creation error:", error);
    return "";
  }
};

export default {
  ImageOptimisation,
  createThumbnail,
  createPlaceholder,
};
