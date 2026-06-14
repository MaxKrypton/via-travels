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
exports.reviewRepository = void 0;
const helpers_1 = require("../utils/helpers");
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const File_upload_1 = __importDefault(require("./File.upload"));
class ReviewRepo {
    createReview(req, res, reviewData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user_ID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let mediaUrl = null;
                if (req.file) {
                    mediaUrl = (yield File_upload_1.default.uploadFileToS3(req.file));
                    if (typeof mediaUrl !== 'string') {
                        return {
                            message: "Failed to upload media",
                            data: '',
                            status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                        };
                    }
                }
                const data = {
                    user_id: user_ID,
                    hotel_id: reviewData.hotel_id,
                    rating: reviewData.rating,
                    mediaUrl: mediaUrl,
                    review_text: reviewData.review_text,
                    created_at: new Date(),
                    updated_at: new Date()
                };
                const createReview = yield database_1.database
                    .insert(schema_1.reviews)
                    .values(data)
                    .returning();
                return {
                    data: createReview[0],
                    status: helpers_1.HttpStatusCodes.CREATED,
                    message: "Review Created Successfully"
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
    updateReview(req, res, reviewData) {
        return __awaiter(this, void 0, void 0, function* () {
            const review_id = req.params.reviewId;
            try {
                const data = Object.assign(Object.assign({}, reviewData), { updated_at: new Date() });
                const updatedReview = yield database_1.database
                    .update(schema_1.reviews)
                    .set(data)
                    .where((0, drizzle_orm_1.eq)(schema_1.reviews.id, review_id))
                    .returning()
                    .then((rows) => rows[0]);
                return {
                    data: updatedReview,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Review Updated Successfully"
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
    getSingleReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const review_id = req.params.reviewId;
                const reviewData = yield database_1.database
                    .select({
                    reviewId: schema_1.reviews.id,
                    userId: schema_1.userTable.id,
                    hotelId: schema_1.hotels.id,
                    rating: schema_1.reviews.rating,
                    mediaUrl: schema_1.reviews.mediaUrl,
                    reviewText: schema_1.reviews.review_text,
                    createdAt: schema_1.reviews.created_at,
                    updatedAt: schema_1.reviews.updated_at
                })
                    .from(schema_1.reviews)
                    .where((0, drizzle_orm_1.eq)(schema_1.reviews.id, review_id))
                    .innerJoin(schema_1.userTable, (0, drizzle_orm_1.eq)(schema_1.reviews.user_id, schema_1.userTable.id))
                    .innerJoin(schema_1.hotels, (0, drizzle_orm_1.eq)(schema_1.reviews.hotel_id, schema_1.hotels.id));
                return {
                    data: reviewData,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Review Retrieved Successfully"
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
    getHotelReviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hotelId = req.params.hotelId;
                const reviewData = yield database_1.database
                    .select({
                    reviewId: schema_1.reviews.id,
                    userId: schema_1.userTable.id,
                    hotelId: schema_1.hotels.id,
                    rating: schema_1.reviews.rating,
                    mediaUrl: schema_1.reviews.mediaUrl,
                    reviewText: schema_1.reviews.review_text,
                    createdAt: schema_1.reviews.created_at,
                    updatedAt: schema_1.reviews.updated_at
                })
                    .from(schema_1.reviews)
                    .where((0, drizzle_orm_1.eq)(schema_1.reviews.hotel_id, hotelId))
                    .innerJoin(schema_1.userTable, (0, drizzle_orm_1.eq)(schema_1.reviews.user_id, schema_1.userTable.id))
                    .innerJoin(schema_1.hotels, (0, drizzle_orm_1.eq)(schema_1.reviews.hotel_id, schema_1.hotels.id));
                return {
                    data: reviewData,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Review Retrieved Successfully"
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
    getAllReviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reviewsData = yield database_1.database
                    .select({
                    reviewId: schema_1.reviews.id,
                    userId: schema_1.userTable.id,
                    username: schema_1.userTable.username,
                    hotelId: schema_1.hotels.id,
                    rating: schema_1.reviews.rating,
                    mediaUrl: schema_1.reviews.mediaUrl,
                    reviewText: schema_1.reviews.review_text,
                    createdAt: schema_1.reviews.created_at,
                    updatedAt: schema_1.reviews.updated_at
                })
                    .from(schema_1.reviews)
                    .innerJoin(schema_1.userTable, (0, drizzle_orm_1.eq)(schema_1.reviews.user_id, schema_1.userTable.id))
                    .innerJoin(schema_1.hotels, (0, drizzle_orm_1.eq)(schema_1.reviews.hotel_id, schema_1.hotels.id));
                return {
                    data: reviewsData,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Reviews Retrieved Successfully"
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
    deleteReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const review_id = req.params.reviewId;
            try {
                const deletedReview = yield database_1.database
                    .delete(schema_1.reviews)
                    .where((0, drizzle_orm_1.eq)(schema_1.reviews.id, review_id))
                    .returning()
                    .then((rows) => rows[0]);
                return {
                    data: deletedReview,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Review Deleted Successfully"
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
exports.reviewRepository = new ReviewRepo();
