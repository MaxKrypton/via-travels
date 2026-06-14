// src/services/VideoStreaming.ts
import { Request, Response } from "express";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SECRETS } from "../utils/helpers";
import { Readable } from "stream";

class VideoStreaming {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: SECRETS.AWS_ACCESS_KEY_ID,
        secretAccessKey: SECRETS.AWS_SECRET_ACCESS_KEY
      },
      region: SECRETS.AWS_REGION
    });
  }

  /**
   * Stream video content from S3 with support for range requests
   * @param req Express request object
   * @param res Express response object
   * @param bucketName S3 bucket name
   * @param videoKey Key/path of the video in S3
   */
  async streamVideo(req: Request, res: Response, bucketName: string, videoKey: string): Promise<void> {
    try {
      // Get video metadata first to determine file size
      const headParams = {
        Bucket: bucketName,
        Key: videoKey,
      };

      // Get the video object from S3
      const videoCommand = new GetObjectCommand(headParams);
      const videoObject = await this.s3Client.send(videoCommand);

      if (!videoObject.ContentLength || !videoObject.ContentType) {
        res.status(404).send("Video not found or metadata unavailable");
        return;
      }

      const videoSize = videoObject.ContentLength;
      const videoType = videoObject.ContentType;

      // Parse Range header
      const range = req.headers.range;

      if (!range) {
        // If no range is provided, return the entire file
        res.writeHead(200, {
          "Content-Length": videoSize,
          "Content-Type": videoType,
        });

        const readable = videoObject.Body as Readable;
        readable.pipe(res);
        return;
      }

      // Parse the range header
      const bytesPrefix = "bytes=";
      if (!range.startsWith(bytesPrefix)) {
        res.status(400).send("Range header must start with 'bytes='");
        return;
      }

      const parts = range.substring(bytesPrefix.length).split("-");
      const start = parseInt(parts[0], 10);

      // Calculate end byte position
      let end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;

      // Chunk size limit (e.g., 1MB chunks)
      const maxChunkSize = 1024 * 1024; // 1MB
      if (end - start + 1 > maxChunkSize) {
        end = start + maxChunkSize - 1;
      }

      // Ensure end doesn't exceed video size
      if (end >= videoSize) {
        end = videoSize - 1;
      }

      const contentLength = end - start + 1;

      // Create a new range request to S3
      const rangeParams = {
        Bucket: bucketName,
        Key: videoKey,
        Range: `bytes=${start}-${end}`,
      };

      const rangeCommand = new GetObjectCommand(rangeParams);
      const rangeObject = await this.s3Client.send(rangeCommand);

      // Send partial content response
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": videoType,
      });

      // Pipe the S3 stream to the response
      const readable = rangeObject.Body as Readable;
      readable.pipe(res);
    } catch (error) {
      console.error("Video streaming error:", error);
      res.status(500).send("Error streaming video");
    }
  }

  /**
   * Get S3 bucket name and key from a full S3 URL
   * @param s3Url Full S3 URL
   * @returns Object containing bucket name and key
   */
  parseS3Url(s3Url: string): { bucketName: string, key: string } | null {
    try {
      const url = new URL(s3Url);

      // Check if this is an S3 URL
      if (!url.hostname.includes('s3') && !url.hostname.includes('amazonaws.com')) {
        return null;
      }

      // Handle different S3 URL formats
      if (url.hostname.includes('s3.amazonaws.com')) {
        // Format: https://s3.amazonaws.com/bucket-name/key
        const pathParts = url.pathname.split('/').filter(Boolean);
        return {
          bucketName: pathParts[0],
          key: pathParts.slice(1).join('/')
        };
      } else if (url.hostname.endsWith('amazonaws.com')) {
        // Format: https://bucket-name.s3.region.amazonaws.com/key
        const bucketName = url.hostname.split('.')[0];
        return {
          bucketName,
          key: url.pathname.substring(1) // Remove leading slash
        };
      }

      return null;
    } catch (error) {
      console.error("Error parsing S3 URL:", error);
      return null;
    }
  }
}

export const videoStreamingService = new VideoStreaming();
