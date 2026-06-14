"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoStreamingController = void 0;
const videoStreaming_1 = require("../utils/videoStreaming");
const Content_videos_1 = require("../repository/Content.videos");
const helpers_1 = require("../utils/helpers");
class VideoStreamingController {
    streamVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const videoId = req.params.videoId;
                // Fetch video details from database
                const videoResult = yield Content_videos_1.videoRepository.getVideo(req, res);
                if (videoResult.status !== helpers_1.HttpStatusCodes.OK || !videoResult.data) {
                    res.status(helpers_1.HttpStatusCodes.NOT_FOUND).json({
                        message: "Video not found"
                    });
                    return;
                }
                const videoUrl = videoResult.data.video_url;
                // Parse S3 URL to get bucket and key
                const s3UrlData = videoStreaming_1.videoStreamingService.parseS3Url(videoUrl);
                if (!s3UrlData) {
                    res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        message: "Invalid video URL format"
                    });
                    return;
                }
                // Stream the video
                yield videoStreaming_1.videoStreamingService.streamVideo(req, res, s3UrlData.bucketName, s3UrlData.key);
                // Increment video views
                // Increment view count asynchronously (don't await)
                yield Content_videos_1.videoRepository.incrementViewCount(req, res).catch(err => {
                    console.error("Failed to increment view count:", err);
                });
            }
            catch (error) {
                console.error("Video streaming error:", error);
                res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "Error streaming video"
                });
            }
        });
    }
    streamFromS3Url(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get video URL from req.params
                const videoUrl = req.params.videoUrl;
                if (!videoUrl) {
                    res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        message: "Missing video URL parameter"
                    });
                    return;
                }
                // Parse S3 URL to get bucket and key
                const s3UrlData = videoStreaming_1.videoStreamingService.parseS3Url(videoUrl);
                if (!s3UrlData) {
                    res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        message: "Invalid S3 URL format"
                    });
                    return;
                }
                // Stream the video
                yield videoStreaming_1.videoStreamingService.streamVideo(req, res, s3UrlData.bucketName, s3UrlData.key);
            }
            catch (error) {
                console.error("Video streaming error:", error);
                res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "Error streaming video"
                });
            }
        });
    }
}
exports.videoStreamingController = new VideoStreamingController();
