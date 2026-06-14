"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRoute = void 0;
// routes/videos.ts
const express_1 = require("express");
const Content_videos_1 = require("../services/Content.videos");
const multer_1 = require("../utils/config/multer");
const authMiddleware_1 = require("../middleware/authMiddleware");
const videostreaming_1 = require("../repository/videostreaming");
const RolesAndPermissions_1 = require("../middleware/RolesAndPermissions");
exports.VideoRoute = (0, express_1.Router)();
// Get all videos
exports.VideoRoute.get('/all', (req, res) => {
    return Content_videos_1.videoService.getAllVideos(req, res);
});
// Stream video with support for range requests
exports.VideoRoute.get('/stream/:videoId', (req, res) => {
    return videostreaming_1.videoStreamingController.streamVideo(req, res);
});
// Stream video from AWS Bucket URL.
exports.VideoRoute.get('/stream/:videoUrl', (req, res) => {
    return videostreaming_1.videoStreamingController.streamFromS3Url(req, res);
});
// Upload new video
exports.VideoRoute.post('/upload/:hotelId', multer_1.upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.customerNotPermitted, (req, res) => {
    return Content_videos_1.videoService.uploadVideo(req, res);
});
// Update video details
exports.VideoRoute.patch('/update/:videoId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.customerNotPermitted, (req, res) => {
    return Content_videos_1.videoService.updateVideo(req, res);
});
// Delete video
exports.VideoRoute.delete('/delete/:videoId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.customerNotPermitted, (req, res) => {
    return Content_videos_1.videoService.deleteVideo(req, res);
});
// Increment view count
exports.VideoRoute.patch('/:videoId/views', authMiddleware_1.authMiddleware, (req, res) => {
    return Content_videos_1.videoService.incrementViewCount(req, res);
});
// Like video
exports.VideoRoute.post('/:videoId/like', authMiddleware_1.authMiddleware, (req, res) => {
    return Content_videos_1.videoService.likeVideo(req, res);
});
// Unlike video
exports.VideoRoute.post('/:videoId/unlike', authMiddleware_1.authMiddleware, (req, res) => {
    return Content_videos_1.videoService.unlikeVideo(req, res);
});
// Save video
exports.VideoRoute.post('/:videoId/save', authMiddleware_1.authMiddleware, (req, res) => {
    return Content_videos_1.videoService.saveVideo(req, res);
});
// Unsave video
exports.VideoRoute.post('/:videoId/unsave', authMiddleware_1.authMiddleware, (req, res) => {
    return Content_videos_1.videoService.unsaveVideo(req, res);
});
// Get user's liked videos
exports.VideoRoute.get('/user/liked', authMiddleware_1.authMiddleware, (req, res) => {
    return Content_videos_1.videoService.getUserLikedVideos(req, res);
});
// Get user's saved videos
exports.VideoRoute.get('/user/saved', authMiddleware_1.authMiddleware, (req, res) => {
    return Content_videos_1.videoService.getUserSavedVideos(req, res);
});
