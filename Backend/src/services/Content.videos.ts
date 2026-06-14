// services/videos.ts
import { videoRepository } from '../repository/Content.videos';
import { Request, Response } from "express";
import { HttpStatusCodes } from "../utils/helpers";
import { MulterRequest } from '../utils/config/multer';
import { videos } from '../utils/config/schema';

// Define types using Drizzle's type inference
type NewVideo = typeof videos.$inferInsert;
type Video = typeof videos.$inferSelect;

class VideoService {
  async uploadVideo(req: MulterRequest, res: Response): Promise<Response> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.video || !files.video[0]) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "No video file provided"
        });
      }

      const { data, status, message } = await videoRepository.uploadVideo(req, res);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }

  async updateVideo(req: Request, res: Response): Promise<Response> {
    try {
      const videoData: Partial<Pick<Video, 'title'>> = {
        ...(req.body.title && { title: req.body.title }),
        ...(req.body.category && { category: req.body.category })
      };

      const { data, status, message } = await videoRepository.updateVideo(req, res, videoData);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }

  /*
  async getVideo(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.getVideo(req, res);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }
  */

  async getVideosByHotelId(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.getVideosByHotelId(req, res);
      return res.status(status).json({ message, data });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }

  async getAllVideos(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.getAllVideos(req, res);

      // Add streaming URLs to each video
      if (data && Array.isArray(data)) {
        const videosWithStreamingUrls = data.map(video => {
          return {
            ...video,
            is_streamable: true
          };
        });

        return res.status(status).json({
          message,
          data: videosWithStreamingUrls
        });
      }

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }

  /*
  async getVideosByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.getVideosByCategory(req, res);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }
  */

  async deleteVideo(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.deleteVideo(req, res);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }

  async incrementViewCount(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.incrementViewCount(req, res);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }

  async likeVideo(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.likeVideo(req, res);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }

  async unlikeVideo(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.unlikeVideo(req, res);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }

  async saveVideo(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.saveVideo(req, res);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }

  async unsaveVideo(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.unsaveVideo(req, res);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }

  async getUserLikedVideos(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.getUserLikedVideos(req, res);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }

  async getUserSavedVideos(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await videoRepository.getUserSavedVideos(req, res);

      return res.status(status).json({
        message,
        data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      });
    }
  }
}

export const videoService = new VideoService();
