// repository/reviews.ts
import { Request, Response } from "express";
import { HttpStatusCodes } from "../utils/helpers";
import { database } from "../utils/config/database";
import { DataResponse } from "../utils/types";
import { MulterRequest } from "../utils/config/multer";
import { reviews, userTable, hotels, userProfiles } from '../utils/config/schema';
import { desc, eq } from "drizzle-orm";
import fileUpload from "./File.upload";

// Define types using Drizzle's type inference
type NewReview = typeof reviews.$inferInsert;
type Review = typeof reviews.$inferSelect;

class ReviewRepo {
  async createReview(
    req: MulterRequest,
    res: Response,
    reviewData: Omit<NewReview, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'mediaUrl'>
  ): Promise<DataResponse> {
    try {
      const user_ID = req.user?.id as string;

      let mediaUrl = null;
      if (req.file) {
         mediaUrl = await fileUpload.uploadFileToS3(req.file) as string;
        if (typeof mediaUrl !== 'string') {
          return {
            message: "Failed to upload media",
            data: '',
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR
          };
        }
      }

      const data: NewReview = {
        user_id: user_ID,
        hotel_id: reviewData.hotel_id,
        rating: reviewData.rating,
        mediaUrl: mediaUrl,
        review_text: reviewData.review_text,
        created_at: new Date(),
        updated_at: new Date()
      };

      const createReview = await database
        .insert(reviews)
        .values(data)
        .returning();

      return {
        data: createReview[0],
        status: HttpStatusCodes.CREATED,
        message: "Review Created Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async updateReview(
    req: Request,
    res: Response,
    reviewData: Partial<Pick<Review, 'rating' | 'review_text'>>
  ): Promise<DataResponse> {
    const review_id = req.params.reviewId;
    try {
      const data: Partial<Review> = {
        ...reviewData,
        updated_at: new Date()
      };

      const updatedReview = await database
        .update(reviews)
        .set(data)
        .where(eq(reviews.id, review_id))
        .returning()
        .then((rows) => rows[0]);

      return {
        data: updatedReview,
        status: HttpStatusCodes.OK,
        message: "Review Updated Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getSingleReview(req: Request, res: Response): Promise<DataResponse> {
    try {
      const review_id = req.params.reviewId;
      const reviewData = await database
        .select({
          reviewId: reviews.id,
          userId: userTable.id,
          hotelId: hotels.id,
          rating: reviews.rating,
          mediaUrl: reviews.mediaUrl,
          reviewText: reviews.review_text,
          createdAt: reviews.created_at,
          updatedAt: reviews.updated_at
        })
        .from(reviews)
        .where(eq(reviews.id, review_id))
        .innerJoin(userTable, eq(reviews.user_id, userTable.id))
        .innerJoin(hotels, eq(reviews.hotel_id, hotels.id))

      return {
        data: reviewData,
        status: HttpStatusCodes.OK,
        message: "Review Retrieved Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getHotelReviews(req: Request, res: Response): Promise<DataResponse> {
    try {
      const hotelId = req.params.hotelId;
      const reviewData = await database
        .select({
          reviewId: reviews.id,
          userId: userTable.id,
          username: userTable.username,
          hotelId: hotels.id,
          rating: reviews.rating,
          mediaUrl: reviews.mediaUrl,
          reviewText: reviews.review_text,
          createdAt: reviews.created_at,
          updatedAt: reviews.updated_at
        })
        .from(reviews)
        .where(eq(reviews.hotel_id, hotelId))
        .innerJoin(userTable, eq(reviews.user_id, userTable.id))
        .innerJoin(hotels, eq(reviews.hotel_id, hotels.id))

      return {
        data: reviewData,
        status: HttpStatusCodes.OK,
        message: "Review Retrieved Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }
  async getAllReviews(req: Request, res: Response): Promise<DataResponse> {
    try {
      const reviewsData = await database
        .select({
          reviewId: reviews.id,
          userId: userTable.id,
          username: userTable.username,
          hotelId: hotels.id,
          rating: reviews.rating,
          mediaUrl: reviews.mediaUrl,
          reviewText: reviews.review_text,
          createdAt: reviews.created_at,
          updatedAt: reviews.updated_at
        })
        .from(reviews)
        .innerJoin(userTable, eq(reviews.user_id, userTable.id))
        .innerJoin(hotels, eq(reviews.hotel_id, hotels.id))

      return {
        data: reviewsData,
        status: HttpStatusCodes.OK,
        message: "Reviews Retrieved Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async deleteReview(req: Request, res: Response): Promise<DataResponse> {
    const review_id = req.params.reviewId;
    try {
      const deletedReview = await database
        .delete(reviews)
        .where(eq(reviews.id, review_id))
        .returning()
        .then((rows) => rows[0]);

      return {
        data: deletedReview,
        status: HttpStatusCodes.OK,
        message: "Review Deleted Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }
}

export const reviewRepository = new ReviewRepo();
