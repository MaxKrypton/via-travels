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
exports.videoService = void 0;
// services/videos.ts
const Content_videos_1 = require("../repository/Content.videos");
const helpers_1 = require("../utils/helpers");
class VideoService {
    uploadVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = req.files;
                if (!files.video || !files.video[0]) {
                    return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        message: "No video file provided"
                    });
                }
                const { data, status, message } = yield Content_videos_1.videoRepository.uploadVideo(req, res);
                return res.status(status).json({
                    message,
                    data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    updateVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const videoData = Object.assign(Object.assign({}, (req.body.title && { title: req.body.title })), (req.body.category && { category: req.body.category }));
                const { data, status, message } = yield Content_videos_1.videoRepository.updateVideo(req, res, videoData);
                return res.status(status).json({
                    message,
                    data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    /*
    async getVideo(req: Request, res: Response): Promise<Response> {
      try {
        const { data, status, message } = await videoRepository.getVideo(req, res);
  
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
    */
    getAllVideos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Content_videos_1.videoRepository.getAllVideos(req, res);
                // Add streaming URLs to each video
                if (data && Array.isArray(data)) {
                    const videosWithStreamingUrls = data.map(video => {
                        return Object.assign(Object.assign({}, video), { is_streamable: true });
                    });
                    return res.status(status).json({
                        message,
                        data: videosWithStreamingUrls
                    });
                }
                return res.status(status).json({
                    message,
                    data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    /*
    async getVideosByCategory(req: Request, res: Response): Promise<Response> {
      try {
        const { data, status, message } = await videoRepository.getVideosByCategory(req, res);
  
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
    */
    deleteVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Content_videos_1.videoRepository.deleteVideo(req, res);
                return res.status(status).json({
                    message,
                    data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    incrementViewCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Content_videos_1.videoRepository.incrementViewCount(req, res);
                return res.status(status).json({
                    message,
                    data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    likeVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Content_videos_1.videoRepository.likeVideo(req, res);
                return res.status(status).json({
                    message,
                    data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    unlikeVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Content_videos_1.videoRepository.unlikeVideo(req, res);
                return res.status(status).json({
                    message,
                    data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    saveVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Content_videos_1.videoRepository.saveVideo(req, res);
                return res.status(status).json({
                    message,
                    data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    unsaveVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Content_videos_1.videoRepository.unsaveVideo(req, res);
                return res.status(status).json({
                    message,
                    data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    getUserLikedVideos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Content_videos_1.videoRepository.getUserLikedVideos(req, res);
                return res.status(status).json({
                    message,
                    data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    getUserSavedVideos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Content_videos_1.videoRepository.getUserSavedVideos(req, res);
                return res.status(status).json({
                    message,
                    data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
}
exports.videoService = new VideoService();
