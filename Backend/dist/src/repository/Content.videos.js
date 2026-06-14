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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoRepository = void 0;
const helpers_1 = require("../utils/helpers");
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const File_upload_1 = __importDefault(require("./File.upload"));
const drizzle_orm_2 = require("drizzle-orm");
class VideoRepo {
    uploadVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hotelId = req.params.hotelId;
                const files = req.files;
                // Upload video file
                const videoUrl = yield File_upload_1.default.uploadFileToS3(files.video[0]);
                if (typeof videoUrl !== 'string') {
                    return {
                        message: "Failed to upload video",
                        data: '',
                        status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                    };
                }
                // Upload thumbnail if provided
                let thumbnailUrl = null;
                if (files.thumbnail && files.thumbnail[0]) {
                    thumbnailUrl = yield File_upload_1.default.uploadFileToS3(files.thumbnail[0]);
                    if (typeof thumbnailUrl !== 'string') {
                        return {
                            message: "Failed to upload thumbnail",
                            data: '',
                            status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                        };
                    }
                }
                const data = {
                    hotel_id: hotelId,
                    video_url: videoUrl,
                    title: req.body.title,
                    thumbnail_url: thumbnailUrl,
                    view_count: 0,
                    created_at: new Date(),
                    updated_at: new Date()
                };
                const createdVideo = yield database_1.database
                    .insert(schema_1.videos)
                    .values(data)
                    .returning();
                return {
                    data: createdVideo[0],
                    status: helpers_1.HttpStatusCodes.CREATED,
                    message: "Video Uploaded Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    updateVideo(req, res, videoData) {
        return __awaiter(this, void 0, void 0, function* () {
            const video_id = req.params.videoId;
            try {
                const data = Object.assign(Object.assign({}, videoData), { updated_at: new Date() });
                const updatedVideo = yield database_1.database
                    .update(schema_1.videos)
                    .set(data)
                    .where((0, drizzle_orm_1.eq)(schema_1.videos.id, video_id))
                    .returning()
                    .then((rows) => rows[0]);
                return {
                    data: updatedVideo,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Video Updated Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    getVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const video_id = req.params.videoId;
                const videoData = yield database_1.database
                    .select()
                    .from(schema_1.videos)
                    .where((0, drizzle_orm_1.eq)(schema_1.videos.id, video_id))
                    .limit(1);
                return {
                    data: videoData[0],
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Video Retrieved Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    getAllVideos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const videosData = yield database_1.database
                    .select()
                    .from(schema_1.videos);
                return {
                    data: videosData,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Videos Retrieved Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
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
    deleteVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const video_id = req.params.videoId;
            try {
                const deletedVideo = yield database_1.database
                    .delete(schema_1.videos)
                    .where((0, drizzle_orm_1.eq)(schema_1.videos.id, video_id))
                    .returning()
                    .then((rows) => rows[0]);
                return {
                    data: deletedVideo,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Video Deleted Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    incrementViewCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const video_id = req.params.videoId;
            try {
                const updatedVideo = yield database_1.database
                    .update(schema_1.videos)
                    .set({
                    view_count: (0, drizzle_orm_2.sql) `${schema_1.videos.view_count} + 1`,
                    updated_at: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.videos.id, video_id))
                    .returning()
                    .then((rows) => rows[0]);
                return {
                    data: updatedVideo,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "View Count Incremented Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    likeVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const video_id = req.params.videoId;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!user_id) {
                return {
                    data: '',
                    message: "User not authenticated",
                    status: helpers_1.HttpStatusCodes.UNAUTHORIZED
                };
            }
            try {
                // Check if already liked
                const existingLike = yield database_1.database
                    .select()
                    .from(schema_1.videoLikes)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.videoLikes.video_id, video_id), (0, drizzle_orm_1.eq)(schema_1.videoLikes.user_id, user_id)))
                    .limit(1);
                if (existingLike.length > 0) {
                    return {
                        data: '',
                        message: "Video already liked",
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST
                    };
                }
                const like = yield database_1.database
                    .insert(schema_1.videoLikes)
                    .values({
                    video_id,
                    user_id,
                    created_at: new Date()
                })
                    .returning();
                return {
                    data: like[0],
                    status: helpers_1.HttpStatusCodes.CREATED,
                    message: "Video Liked Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    unlikeVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const video_id = req.params.videoId;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!user_id) {
                return {
                    data: '',
                    message: "User not authenticated",
                    status: helpers_1.HttpStatusCodes.UNAUTHORIZED
                };
            }
            try {
                const deletedLike = yield database_1.database
                    .delete(schema_1.videoLikes)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.videoLikes.video_id, video_id), (0, drizzle_orm_1.eq)(schema_1.videoLikes.user_id, user_id)))
                    .returning()
                    .then((rows) => rows[0]);
                if (!deletedLike) {
                    return {
                        data: '',
                        message: "Like not found",
                        status: helpers_1.HttpStatusCodes.NOT_FOUND
                    };
                }
                return {
                    data: deletedLike,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Video Unliked Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    saveVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const video_id = req.params.videoId;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!user_id) {
                return {
                    data: '',
                    message: "User not authenticated",
                    status: helpers_1.HttpStatusCodes.UNAUTHORIZED
                };
            }
            try {
                // Check if already saved
                const existingSave = yield database_1.database
                    .select()
                    .from(schema_1.videoSaves)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.videoSaves.video_id, video_id), (0, drizzle_orm_1.eq)(schema_1.videoSaves.user_id, user_id)))
                    .limit(1);
                if (existingSave.length > 0) {
                    return {
                        data: '',
                        message: "Video already saved",
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST
                    };
                }
                const save = yield database_1.database
                    .insert(schema_1.videoSaves)
                    .values({
                    video_id,
                    user_id,
                    created_at: new Date()
                })
                    .returning();
                return {
                    data: save[0],
                    status: helpers_1.HttpStatusCodes.CREATED,
                    message: "Video Saved Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    unsaveVideo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const video_id = req.params.videoId;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!user_id) {
                return {
                    data: '',
                    message: "User not authenticated",
                    status: helpers_1.HttpStatusCodes.UNAUTHORIZED
                };
            }
            try {
                const deletedSave = yield database_1.database
                    .delete(schema_1.videoSaves)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.videoSaves.video_id, video_id), (0, drizzle_orm_1.eq)(schema_1.videoSaves.user_id, user_id)))
                    .returning()
                    .then((rows) => rows[0]);
                if (!deletedSave) {
                    return {
                        data: '',
                        message: "Save not found",
                        status: helpers_1.HttpStatusCodes.NOT_FOUND
                    };
                }
                return {
                    data: deletedSave,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Video Unsaved Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    getUserLikedVideos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!user_id) {
                return {
                    data: '',
                    message: "User not authenticated",
                    status: helpers_1.HttpStatusCodes.UNAUTHORIZED
                };
            }
            try {
                const likedVideos = yield database_1.database
                    .select({
                    video: schema_1.videos,
                    liked_at: schema_1.videoLikes.created_at
                })
                    .from(schema_1.videoLikes)
                    .innerJoin(schema_1.videos, (0, drizzle_orm_1.eq)(schema_1.videoLikes.video_id, schema_1.videos.id))
                    .where((0, drizzle_orm_1.eq)(schema_1.videoLikes.user_id, user_id));
                return {
                    data: likedVideos,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Liked Videos Retrieved Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    getUserSavedVideos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!user_id) {
                return {
                    data: '',
                    message: "User not authenticated",
                    status: helpers_1.HttpStatusCodes.UNAUTHORIZED
                };
            }
            try {
                const savedVideos = yield database_1.database
                    .select({
                    video: schema_1.videos,
                    saved_at: schema_1.videoSaves.created_at
                })
                    .from(schema_1.videoSaves)
                    .innerJoin(schema_1.videos, (0, drizzle_orm_1.eq)(schema_1.videoSaves.video_id, schema_1.videos.id))
                    .where((0, drizzle_orm_1.eq)(schema_1.videoSaves.user_id, user_id));
                return {
                    data: savedVideos,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Saved Videos Retrieved Successfully"
                };
            }
            catch (error) {
                return {
                    data: '',
                    message: error,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
}
exports.videoRepository = new VideoRepo();
