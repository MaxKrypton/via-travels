// src/controllers/VideoStreamingController.ts
import { Request, Response } from "express";
import { videoStreamingService } from "../utils/videoStreaming";
import { videoRepository } from "../repository/Content.videos";
import { HttpStatusCodes } from "../utils/helpers";

class VideoStreamingController {

  async streamVideo(req: Request, res: Response): Promise<void> {
    try {
      const videoId = req.params.videoId;
      // Fetch video details from database
      const videoResult = await videoRepository.getVideo(req, res);

      if (videoResult.status !== HttpStatusCodes.OK || !videoResult.data) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Video not found"
        });
        return;
      }

      const videoUrl = videoResult.data.video_url;

      // Parse S3 URL to get bucket and key
      const s3UrlData = videoStreamingService.parseS3Url(videoUrl);

      if (!s3UrlData) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Invalid video URL format"
        });
        return;
      }

      // Stream the video
      await videoStreamingService.streamVideo(
        req,
        res,
        s3UrlData.bucketName,
        s3UrlData.key
      );
      // Increment video views
      // Increment view count asynchronously (don't await)
      await videoRepository.incrementViewCount(req, res).catch(err => {
        console.error("Failed to increment view count:", err);
      });
    } catch (error) {
      console.error("Video streaming error:", error);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error streaming video"
      });
    }
  }
  async streamFromS3Url(req: Request, res: Response): Promise<void> {
    try {
      // Get video URL from req.params
      const videoUrl = req.params.videoUrl

      if (!videoUrl) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Missing video URL parameter"
        });
        return;
      }

      // Parse S3 URL to get bucket and key
      const s3UrlData = videoStreamingService.parseS3Url(videoUrl);

      if (!s3UrlData) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Invalid S3 URL format"
        });
        return;
      }

      // Stream the video
      await videoStreamingService.streamVideo(
        req,
        res,
        s3UrlData.bucketName,
        s3UrlData.key
      );
    } catch (error) {
      console.error("Video streaming error:", error);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error streaming video"
      });
    }
  }
}

export const videoStreamingController = new VideoStreamingController();
