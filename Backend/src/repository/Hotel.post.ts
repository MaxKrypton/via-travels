// repository/hotelPost.ts
import { Request, Response } from "express";
import { HttpStatusCodes } from "../utils/helpers";
import { database } from "../utils/config/database";
import { DataResponse } from "../utils/types";
import { MulterRequest } from "../utils/config/multer";
import { hotelPosts, hotels, reviews, room, roomPricing } from '../utils/config/schema';
import { eq, sql } from "drizzle-orm";
import fileUpload from "./File.upload";

// Define types using Drizzle's type inference
type NewHotelPost = typeof hotelPosts.$inferInsert;

class HotelPostRepo {
  async uploadHotelPost(
    req: MulterRequest,
    res: Response,
    postData: Omit<NewHotelPost, 'id' | 'url' | 'created_at' | 'updated_at'>
  ): Promise<DataResponse> {
    try {
      if (!req.file) {
        return {
          message: "No post file provided",
          data: '',
          status: HttpStatusCodes.BAD_REQUEST
        };
      }

      const postUrl = await fileUpload.uploadFileToS3(req.file);
      if (typeof postUrl !== 'string') {
        return {
          message: "Failed to upload post",
          data: '',
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR
        };
      }

      const data = {
        hotel_id: postData.hotel_id,
        caption: postData.caption,
        postDescription: postData.postDescription,
        url: postUrl,
        created_at: new Date(),
        updated_at: new Date()
      };

      const createdPost = await database
        .insert(hotelPosts)
        .values(data)
        .returning();

      return {
        data: createdPost[0],
        status: HttpStatusCodes.CREATED,
        message: "Hotel post uploaded successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async updateHotelPost(
    req: MulterRequest,
    res: Response,
    postData: Partial<Pick<NewHotelPost, 'caption' | 'postDescription'>>
  ): Promise<DataResponse> {
    const post_id = req.params.postId;
    try {
      // Create update data object based on schema
      const data: Partial<NewHotelPost> = {
        ...postData,
        updated_at: new Date()
      };

      // Handle file upload if there is one
      if (req.file) {
        const postUrl = await fileUpload.uploadFileToS3(req.file);
        if (typeof postUrl !== 'string') {
          return {
            message: "Failed to upload post image",
            data: '',
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR
          };
        }
        data.url = postUrl;
      }

      const updatedPost = await database
        .update(hotelPosts)
        .set(data)
        .where(eq(hotelPosts.id, post_id))
        .returning()
        .then((rows) => rows[0]);

      return {
        data: updatedPost,
        status: HttpStatusCodes.OK,
        message: "Hotel post updated successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAllHotelPosts(req: Request, res: Response): Promise<DataResponse> {
    try {
      // Subquery to count reviews and calculate average rating for each hotel
      const reviewStats = database
        .select({
          hotel_id: reviews.hotel_id,
          avg_rating: sql`ROUND(AVG(${reviews.rating}), 1)`.as('avg_rating'),
          review_count: sql`COUNT(${reviews.id})`.as('review_count')
        })
        .from(reviews)
        .groupBy(reviews.hotel_id)
        .as('review_stats');

      // Subquery to get the base price for each hotel (from the first room)
      const roomPrices = database
        .select({
          hotel_id: room.hotel_id,
          base_price: sql`MIN(${roomPricing.roomFee})`.as('base_price'),
          currency: roomPricing.currency
        })
        .from(roomPricing)
        .innerJoin(room, eq(roomPricing.roomTypeId, room.id))
        .groupBy(sql`${room.hotel_id}, ${roomPricing.currency}`)
        .as('room_prices');

      const postData = await database
        .select({
          id: hotelPosts.id,
          post_caption: hotelPosts.caption,
          hotel_id: hotelPosts.hotel_id,
          hotel_name: hotels.name,
          postDescription: hotelPosts.postDescription,
          url: hotelPosts.url,
          created_at: hotelPosts.created_at,
          updated_at: hotelPosts.updated_at,
          base_price: roomPrices.base_price,
          currency: roomPrices.currency,
          avg_rating: reviewStats.avg_rating,
          review_count: reviewStats.review_count
        })
        .from(hotelPosts)
        .innerJoin(hotels, eq(hotelPosts.hotel_id, hotels.id))
        .leftJoin(reviewStats, eq(hotels.id, reviewStats.hotel_id))
        .leftJoin(roomPrices, eq(hotels.id, roomPrices.hotel_id))
        .orderBy(hotelPosts.created_at);

      // Format the results to handle null values and apply proper types
      const formattedPostData = postData.map(post => ({
        ...post,
        avg_rating: post.avg_rating ? parseFloat(post.avg_rating as string) : 0,
        review_count: post.review_count ? parseInt(post.review_count as string) : 0,
        base_price: post.base_price ? parseFloat(post.base_price as string) : 0,
        currency: post.currency || 'USD'
      }));

      return {
        data: formattedPostData,
        status: HttpStatusCodes.OK,
        message: "All hotel posts retrieved successfully"
      };
    } catch (error) {
      console.error('Error fetching hotel posts with additional data:', error);
      return {
        data: '',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getHotelPostById(req: Request, res: Response): Promise<DataResponse> {
    try {
      const postData = await database
        .select({
          id: hotelPosts.id,
          post_caption: hotelPosts.caption,
          hotel_id: hotelPosts.hotel_id,
          hotel_name: hotels.name,
          postDescription: hotelPosts.postDescription,
          url: hotelPosts.url,
          created_at: hotelPosts.created_at,
          updated_at: hotelPosts.updated_at,
        })
        .from(hotelPosts)
        .innerJoin(hotels, eq(hotelPosts.hotel_id, hotels.id))
        .orderBy(hotelPosts.created_at)
        .where(eq(hotelPosts.hotel_id, hotels.id));

      return {
        data: postData,
        status: HttpStatusCodes.OK,
        message: "All hotel posts retrieved successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async deleteHotelPost(req: Request, res: Response): Promise<DataResponse> {
    const post_id = req.params.postId;
    try {
      const deletedPost = await database
        .delete(hotelPosts)
        .where(eq(hotelPosts.id, post_id))
        .returning()
        .then((rows) => rows[0]);

      return {
        data: deletedPost,
        status: HttpStatusCodes.OK,
        message: "Hotel post deleted successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }
}

export const hotelPostRepository = new HotelPostRepo();
