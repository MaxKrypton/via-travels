
// repository/hotelMedia.ts
import { Request, Response } from "express";
import { HttpStatusCodes } from "../utils/helpers";
import { database } from "../utils/config/database";
import { DataResponse } from "../utils/types";
import { MulterRequest } from "../utils/config/multer";
import { hotelMedia, hotels } from '../utils/config/schema';
import { eq } from "drizzle-orm";
import fileUpload from "./File.upload";

// Define types using Drizzle's type inference
type NewHotelMedia = typeof hotelMedia.$inferInsert;
type HotelMedia = typeof hotelMedia.$inferSelect;

class HotelMediaRepo {
  async uploadMedia(
    req: MulterRequest,
    res: Response,
    mediaData: Omit<NewHotelMedia, 'id' | 'url' | 'created_at' | 'updated_at'>
  ): Promise<DataResponse> {
    try {
      if (!req.file) {
        return {
          message: "No media file provided",
          data: '',
          status: HttpStatusCodes.BAD_REQUEST
        };
      }
      const mediaUrl = await fileUpload.uploadFileToS3(req.file);
      if (typeof mediaUrl !== 'string') {
        return {
          message: "Failed to upload media",
          data: '',
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR
        };
      }

      const data: NewHotelMedia = {
        ...mediaData,
        url: mediaUrl,
        created_at: new Date(),
        updated_at: new Date()
      };

      const createdMedia = await database
        .insert(hotelMedia)
        .values(data)
        .returning();

      return {
        data: createdMedia[0],
        status: HttpStatusCodes.CREATED,
        message: "Hotel Media Uploaded Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async updateMedia(
    req: Request,
    res: Response,
    mediaData: Partial<Pick<HotelMedia, 'media_type' | 'media_category'>>
  ): Promise<DataResponse> {
    const media_id = req.params.mediaId;
    try {
      if (!req.file) {
        return {
          message: "No media file provided",
          data: '',
          status: HttpStatusCodes.BAD_REQUEST
        };
      }

      const mediaUrl = await fileUpload.uploadFileToS3(req.file);
      if (typeof mediaUrl !== 'string') {
        return {
          message: "Failed to upload media",
          data: '',
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR
        };
      }

      const data: Partial<HotelMedia> = {
        ...mediaData,
        url: mediaUrl,
        updated_at: new Date()
      };

      const updatedMedia = await database
        .update(hotelMedia)
        .set(data)
        .where(eq(hotelMedia.id, media_id))
        .returning()
        .then((rows) => rows[0]);

      return {
        data: updatedMedia,
        status: HttpStatusCodes.OK,
        message: "Hotel Media Updated Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getHotelMedia(req: Request, res: Response): Promise<DataResponse> {
    try {
      const hotel_id = req.params.hotelId;
      const mediaData = await database
        .select()
        .from(hotelMedia)
        .where(eq(hotelMedia.hotel_id, hotel_id))
        .innerJoin(hotels, eq(hotelMedia.hotel_id, hotels.id));

      return {
        data: mediaData,
        status: HttpStatusCodes.OK,
        message: "Hotel Media Retrieved Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async deleteMedia(req: Request, res: Response): Promise<DataResponse> {
    const media_id = req.params.mediaId;
    try {
      const deletedMedia = await database
        .delete(hotelMedia)
        .where(eq(hotelMedia.id, media_id))
        .returning()
        .then((rows) => rows[0]);

      return {
        data: deletedMedia,
        status: HttpStatusCodes.OK,
        message: "Hotel Media Deleted Successfully"
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

export const hotelMediaRepository = new HotelMediaRepo();
