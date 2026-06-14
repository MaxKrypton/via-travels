import { Request, Response } from "express";
import { HttpStatusCodes } from "../utils/helpers";
import { database } from "../utils/config/database";
import { DataResponse } from "../utils/types";
import { MulterRequest } from "../utils/config/multer";
import { videos, videoLikes, videoSaves } from '../utils/config/schema';
import { eq, and } from "drizzle-orm";
import fileUpload from "./File.upload";
import { sql } from "drizzle-orm";

// Define types using Drizzle's type inference
type NewVideo = typeof videos.$inferInsert;
type Video = typeof videos.$inferSelect;

class VideoRepo {
  async uploadVideo(
    req: MulterRequest,
    res: Response
  ): Promise<DataResponse> {
    try {
      const hotelId = req.params.hotelId;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Upload video file
      const videoUrl = await fileUpload.uploadFileToS3(files.video[0]);
      if (typeof videoUrl !== 'string') {
        return {
          message: "Failed to upload video",
          data: '',
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR
        };
      }

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (files.thumbnail && files.thumbnail[0]) {
        thumbnailUrl = await fileUpload.uploadFileToS3(files.thumbnail[0]);
        if (typeof thumbnailUrl !== 'string') {
          return {
            message: "Failed to upload thumbnail",
            data: '',
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR
          };
        }
      }

      const data: NewVideo = {
        hotel_id: hotelId,
        video_url: videoUrl,
        title: req.body.title,
        thumbnail_url: thumbnailUrl,
        view_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      };

      const createdVideo = await database
        .insert(videos)
        .values(data)
        .returning();

      return {
        data: createdVideo[0],
        status: HttpStatusCodes.CREATED,
        message: "Video Uploaded Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async updateVideo(
    req: Request,
    res: Response,
    videoData: Partial<Pick<Video, 'title'>>
  ): Promise<DataResponse> {
    const video_id = req.params.videoId;
    try {
      const data: Partial<Video> = {
        ...videoData,
        updated_at: new Date()
      };

      const updatedVideo = await database
        .update(videos)
        .set(data)
        .where(eq(videos.id, video_id))
        .returning()
        .then((rows) => rows[0]);

      return {
        data: updatedVideo,
        status: HttpStatusCodes.OK,
        message: "Video Updated Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getVideo(req: Request, res: Response): Promise<DataResponse> {
    try {
      const video_id = req.params.videoId;
      const videoData = await database
        .select()
        .from(videos)
        .where(eq(videos.id, video_id))
        .limit(1);

      return {
        data: videoData[0],
        status: HttpStatusCodes.OK,
        message: "Video Retrieved Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAllVideos(req: Request, res: Response): Promise<DataResponse> {
    try {
      const videosData = await database
        .select()
        .from(videos)
      return {
        data: videosData,
        status: HttpStatusCodes.OK,
        message: "Videos Retrieved Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getVideosByHotelId(req: Request, res: Response): Promise<DataResponse> {
    const hotel_id = req.params.hotelId;
    try {
      const videosData = await database
        .select()
        .from(videos)
        .where(eq(videos.hotel_id, hotel_id));
      return {
        data: videosData,
        status: HttpStatusCodes.OK,
        message: "Hotel Videos Retrieved Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  /*
  async getVideosByCategory(req: Request, res: Response): Promise<DataResponse> {
    try {
      const category = req.params.category;
      const videosData = await database
        .select()
        .from(videos)
        .where(eq(videos.category, category))

      return {
        data: videosData,
        status: HttpStatusCodes.OK,
        message: "Videos Retrieved Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }
*/
  async deleteVideo(req: Request, res: Response): Promise<DataResponse> {
    const video_id = req.params.videoId;
    try {
      const deletedVideo = await database
        .delete(videos)
        .where(eq(videos.id, video_id))
        .returning()
        .then((rows) => rows[0]);

      return {
        data: deletedVideo,
        status: HttpStatusCodes.OK,
        message: "Video Deleted Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async incrementViewCount(req: Request, res: Response): Promise<DataResponse> {
    const video_id = req.params.videoId;
    try {
      const updatedVideo = await database
        .update(videos)
        .set({
          view_count: sql`${videos.view_count} + 1`,
          updated_at: new Date()
        })
        .where(eq(videos.id, video_id))
        .returning()
        .then((rows) => rows[0]);

      return {
        data: updatedVideo,
        status: HttpStatusCodes.OK,
        message: "View Count Incremented Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async likeVideo(req: Request, res: Response): Promise<DataResponse> {
    const video_id = req.params.videoId;
    const user_id = (req as any).user?.userId;

    if (!user_id) {
      return {
        data: '',
        message: "User not authenticated",
        status: HttpStatusCodes.UNAUTHORIZED
      };
    }

    try {
      // Check if already liked
      const existingLike = await database
        .select()
        .from(videoLikes)
        .where(and(eq(videoLikes.video_id, video_id), eq(videoLikes.user_id, user_id)))
        .limit(1);

      if (existingLike.length > 0) {
        return {
          data: '',
          message: "Video already liked",
          status: HttpStatusCodes.BAD_REQUEST
        };
      }

      const like = await database
        .insert(videoLikes)
        .values({
          video_id,
          user_id,
          created_at: new Date()
        })
        .returning();

      return {
        data: like[0],
        status: HttpStatusCodes.CREATED,
        message: "Video Liked Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async unlikeVideo(req: Request, res: Response): Promise<DataResponse> {
    const video_id = req.params.videoId;
    const user_id = (req as any).user?.userId;

    if (!user_id) {
      return {
        data: '',
        message: "User not authenticated",
        status: HttpStatusCodes.UNAUTHORIZED
      };
    }

    try {
      const deletedLike = await database
        .delete(videoLikes)
        .where(and(eq(videoLikes.video_id, video_id), eq(videoLikes.user_id, user_id)))
        .returning()
        .then((rows) => rows[0]);

      if (!deletedLike) {
        return {
          data: '',
          message: "Like not found",
          status: HttpStatusCodes.NOT_FOUND
        };
      }

      return {
        data: deletedLike,
        status: HttpStatusCodes.OK,
        message: "Video Unliked Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async saveVideo(req: Request, res: Response): Promise<DataResponse> {
    const video_id = req.params.videoId;
    const user_id = (req as any).user?.userId;

    if (!user_id) {
      return {
        data: '',
        message: "User not authenticated",
        status: HttpStatusCodes.UNAUTHORIZED
      };
    }

    try {
      // Check if already saved
      const existingSave = await database
        .select()
        .from(videoSaves)
        .where(and(eq(videoSaves.video_id, video_id), eq(videoSaves.user_id, user_id)))
        .limit(1);

      if (existingSave.length > 0) {
        return {
          data: '',
          message: "Video already saved",
          status: HttpStatusCodes.BAD_REQUEST
        };
      }

      const save = await database
        .insert(videoSaves)
        .values({
          video_id,
          user_id,
          created_at: new Date()
        })
        .returning();

      return {
        data: save[0],
        status: HttpStatusCodes.CREATED,
        message: "Video Saved Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async unsaveVideo(req: Request, res: Response): Promise<DataResponse> {
    const video_id = req.params.videoId;
    const user_id = (req as any).user?.userId;

    if (!user_id) {
      return {
        data: '',
        message: "User not authenticated",
        status: HttpStatusCodes.UNAUTHORIZED
      };
    }

    try {
      const deletedSave = await database
        .delete(videoSaves)
        .where(and(eq(videoSaves.video_id, video_id), eq(videoSaves.user_id, user_id)))
        .returning()
        .then((rows) => rows[0]);

      if (!deletedSave) {
        return {
          data: '',
          message: "Save not found",
          status: HttpStatusCodes.NOT_FOUND
        };
      }

      return {
        data: deletedSave,
        status: HttpStatusCodes.OK,
        message: "Video Unsaved Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getUserLikedVideos(req: Request, res: Response): Promise<DataResponse> {
    const user_id = (req as any).user?.userId;

    if (!user_id) {
      return {
        data: '',
        message: "User not authenticated",
        status: HttpStatusCodes.UNAUTHORIZED
      };
    }

    try {
      const likedVideos = await database
        .select({
          video: videos,
          liked_at: videoLikes.created_at
        })
        .from(videoLikes)
        .innerJoin(videos, eq(videoLikes.video_id, videos.id))
        .where(eq(videoLikes.user_id, user_id));

      return {
        data: likedVideos,
        status: HttpStatusCodes.OK,
        message: "Liked Videos Retrieved Successfully"
      };
    } catch (error) {
      return {
        data: '',
        message: error as string,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getUserSavedVideos(req: Request, res: Response): Promise<DataResponse> {
    const user_id = (req as any).user?.userId;

    if (!user_id) {
      return {
        data: '',
        message: "User not authenticated",
        status: HttpStatusCodes.UNAUTHORIZED
      };
    }

    try {
      const savedVideos = await database
        .select({
          video: videos,
          saved_at: videoSaves.created_at
        })
        .from(videoSaves)
        .innerJoin(videos, eq(videoSaves.video_id, videos.id))
        .where(eq(videoSaves.user_id, user_id));

      return {
        data: savedVideos,
        status: HttpStatusCodes.OK,
        message: "Saved Videos Retrieved Successfully"
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

export const videoRepository = new VideoRepo();
