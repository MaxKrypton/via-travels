// services/hotelMedia.ts
import { hotelMediaRepository } from '../repository/Hotel.media';
import { Request, Response } from "express";
import { HttpStatusCodes } from "../utils/helpers";
import { MulterRequest } from '../utils/config/multer';
import { hotelMedia } from '../utils/config/schema';

// Define types using Drizzle's type inference
type NewHotelMedia = typeof hotelMedia.$inferInsert;
type HotelMedia = typeof hotelMedia.$inferSelect;

class HotelMediaService {
  async uploadMedia(req: MulterRequest, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "No media file provided"
        });
      }

      const mediaData: Omit<NewHotelMedia, 'id' | 'url' | 'created_at' | 'updated_at'> = {
        hotel_id: req.params.hotelId,
        media_type: req.body.media_type,
        media_category: req.body.media_category,
      };

      const { data, status, message } = await hotelMediaRepository.uploadMedia(req, res, mediaData);

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

  async updateMedia(req: Request, res: Response): Promise<Response> {
    try {
      const mediaData: Partial<Pick<HotelMedia, 'media_type' | 'media_category'>> = {
        ...(req.body.media_type && { media_type: req.body.media_type }),
        ...(req.body.media_category && { media_category: req.body.media_category })
      };

      const { data, status, message } = await hotelMediaRepository.updateMedia(req, res, mediaData);

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

  async getHotelMedia(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await hotelMediaRepository.getHotelMedia(req, res);

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

  async deleteMedia(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await hotelMediaRepository.deleteMedia(req, res);

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

export const hotelMediaService = new HotelMediaService();
