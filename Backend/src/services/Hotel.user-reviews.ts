// services/reviews.ts
import { reviewRepository } from '../repository/Hotel.user-reviews';
import { Request, Response } from "express";
import { HttpStatusCodes } from "../utils/helpers";
import { MulterRequest } from '../utils/config/multer';
import { reviews } from '../utils/config/schema';

// Define types using Drizzle's type inference
type NewReview = typeof reviews.$inferInsert;
type Review = typeof reviews.$inferSelect;

class ReviewService {
  async createReview(req: MulterRequest, res: Response): Promise<Response> {
    const hotelId = req.params.hotelId;
    const bookingId = req.params.bookingId;
    try {
      // Extract the review data from request body
      const reviewData: Omit<NewReview, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'mediaUrl'> = {
        hotel_id: hotelId,
        rating: req.body.rating,
        review_text: req.body.review_text,
      };

      const { data, status, message } = await reviewRepository.createReview(req, res, reviewData);

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

  async updateReview(req: Request, res: Response): Promise<Response> {
    try {
      // Extract only updatable fields
      const reviewData: Partial<Pick<Review, 'rating' | 'review_text'>> = {
        ...(req.body.rating && { rating: parseInt(req.body.rating) }),
        ...(req.body.review_text && { review_text: req.body.review_text })
      };

      const { data, status, message } = await reviewRepository.updateReview(req, res, reviewData);

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

  async getSpecificReview(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await reviewRepository.getSingleReview(req, res);

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

  async getSpecificHotelReview(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await reviewRepository.getHotelReviews(req, res);

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

  async getAllReviews(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await reviewRepository.getAllReviews(req, res);

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

  async deleteReview(req: Request, res: Response): Promise<Response> {
    try {
      const { data, status, message } = await reviewRepository.deleteReview(req, res);

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

export const reviewService = new ReviewService();
