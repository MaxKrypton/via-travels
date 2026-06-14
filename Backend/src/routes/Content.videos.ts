// routes/videos.ts
import { Request, Response, Router } from "express";
import { videoService } from "../services/Content.videos";
import { MulterRequest, upload } from "../utils/config/multer";
import { authMiddleware } from "../middleware/authMiddleware";
import { videoStreamingController } from "../repository/videostreaming";
import { rolesAndPermissions } from "../middleware/RolesAndPermissions";

export const VideoRoute = Router();

// Get all videos
VideoRoute.get('/all', (req: Request, res: Response) => {
  return videoService.getAllVideos(req, res);
});

// Get videos by hotel ID
VideoRoute.get('/hotel/:hotelId', (req: Request, res: Response) => {
  return videoService.getVideosByHotelId(req, res);
});

// Stream video with support for range requests
VideoRoute.get('/stream/:videoId', (req: Request, res: Response) => {
  return videoStreamingController.streamVideo(req, res);
});

// Stream video from AWS Bucket URL.
VideoRoute.get('/stream/:videoUrl', (req: Request, res: Response) => {
  return videoStreamingController.streamFromS3Url(req, res);
})

// Upload new video
VideoRoute.post('/upload/:hotelId',
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  authMiddleware,
  rolesAndPermissions.customerNotPermitted,
  (req: Request, res: Response) => {
    return videoService.uploadVideo(req as MulterRequest, res);
  }
);

// Update video details
VideoRoute.patch('/update/:videoId', authMiddleware, rolesAndPermissions.customerNotPermitted, (req: Request, res: Response) => {
  return videoService.updateVideo(req, res);
});

// Delete video
VideoRoute.delete('/delete/:videoId', authMiddleware, rolesAndPermissions.customerNotPermitted, (req: Request, res: Response) => {
  return videoService.deleteVideo(req, res);
});

// Increment view count
VideoRoute.patch('/:videoId/views', authMiddleware, (req: Request, res: Response) => {
  return videoService.incrementViewCount(req, res);
});

// Like video
VideoRoute.post('/:videoId/like', authMiddleware, (req: Request, res: Response) => {
  return videoService.likeVideo(req, res);
});

// Unlike video
VideoRoute.post('/:videoId/unlike', authMiddleware, (req: Request, res: Response) => {
  return videoService.unlikeVideo(req, res);
});

// Save video
VideoRoute.post('/:videoId/save', authMiddleware, (req: Request, res: Response) => {
  return videoService.saveVideo(req, res);
});

// Unsave video
VideoRoute.post('/:videoId/unsave', authMiddleware, (req: Request, res: Response) => {
  return videoService.unsaveVideo(req, res);
});

// Get user's liked videos
VideoRoute.get('/user/liked', authMiddleware, (req: Request, res: Response) => {
  return videoService.getUserLikedVideos(req, res);
});

// Get user's saved videos
VideoRoute.get('/user/saved', authMiddleware, (req: Request, res: Response) => {
  return videoService.getUserSavedVideos(req, res);
});
