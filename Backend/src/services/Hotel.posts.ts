// services/hotelPost.ts
import { hotelPostRepository } from '../repository/Hotel.post';
import { Request, Response } from "express";
import { HttpStatusCodes } from "../utils/helpers";
import { MulterRequest } from '../utils/config/multer';
import { hotelPosts } from '../utils/config/schema';

// Define types using Drizzle's type inference
type NewHotelPost = typeof hotelPosts.$inferInsert;
type HotelPost = typeof hotelPosts.$inferSelect;

class HotelPostService {
  async uploadPost(req: MulterRequest, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "No media file provided"
        });
      }

      const postData: Omit<NewHotelPost, 'id' | 'url' | 'created_at' | 'updated_at'> = {
        hotel_id: req.params.hotelId,
        caption: req.body.caption,
        postDescription: req.body.postDescription
      };

      const { data, status, message } = await hotelPostRepository.uploadHotelPost(req, res, postData);

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

  async updatePost(req: Request, res: Response): Promise<Response> {
    try {
      const postData: Partial<Pick<HotelPost, 'caption' | 'postDescription'>> = {
        ...(req.body.caption && { caption: req.body.caption }),
        ...(req.body.postDescription && { postDescription: req.body.postDescription })
      };

      const { data, status, message } = await hotelPostRepository.updateHotelPost(req as MulterRequest, res, postData);

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


  async getAllHotelPosts(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await hotelPostRepository.getAllHotelPosts(req, res);

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

  async getHotelPostById(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await hotelPostRepository.getHotelPostById(req, res);

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

  async deleteHotelPost(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await hotelPostRepository.deleteHotelPost(req, res);

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

export const hotelPostService = new HotelPostService();
