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
exports.hotelPostRepository = void 0;
const helpers_1 = require("../utils/helpers");
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const File_upload_1 = __importDefault(require("./File.upload"));
class HotelPostRepo {
    uploadHotelPost(req, res, postData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.file) {
                    return {
                        message: "No post file provided",
                        data: '',
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST
                    };
                }
                const postUrl = yield File_upload_1.default.uploadFileToS3(req.file);
                if (typeof postUrl !== 'string') {
                    return {
                        message: "Failed to upload post",
                        data: '',
                        status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
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
                const createdPost = yield database_1.database
                    .insert(schema_1.hotelPosts)
                    .values(data)
                    .returning();
                return {
                    data: createdPost[0],
                    status: helpers_1.HttpStatusCodes.CREATED,
                    message: "Hotel post uploaded successfully"
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
    updateHotelPost(req, res, postData) {
        return __awaiter(this, void 0, void 0, function* () {
            const post_id = req.params.postId;
            try {
                // Create update data object based on schema
                const data = Object.assign(Object.assign({}, postData), { updated_at: new Date() });
                // Handle file upload if there is one
                if (req.file) {
                    const postUrl = yield File_upload_1.default.uploadFileToS3(req.file);
                    if (typeof postUrl !== 'string') {
                        return {
                            message: "Failed to upload post image",
                            data: '',
                            status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                        };
                    }
                    data.url = postUrl;
                }
                const updatedPost = yield database_1.database
                    .update(schema_1.hotelPosts)
                    .set(data)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotelPosts.id, post_id))
                    .returning()
                    .then((rows) => rows[0]);
                return {
                    data: updatedPost,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Hotel post updated successfully"
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
    getAllHotelPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Subquery to count reviews and calculate average rating for each hotel
                const reviewStats = database_1.database
                    .select({
                    hotel_id: schema_1.reviews.hotel_id,
                    avg_rating: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.reviews.rating}), 1)`.as('avg_rating'),
                    review_count: (0, drizzle_orm_1.sql) `COUNT(${schema_1.reviews.id})`.as('review_count')
                })
                    .from(schema_1.reviews)
                    .groupBy(schema_1.reviews.hotel_id)
                    .as('review_stats');
                // Subquery to get the base price for each hotel (from the first room)
                const roomPrices = database_1.database
                    .select({
                    hotel_id: schema_1.room.hotel_id,
                    base_price: (0, drizzle_orm_1.sql) `MIN(${schema_1.roomPricing.roomFee})`.as('base_price'),
                    currency: schema_1.roomPricing.currency
                })
                    .from(schema_1.roomPricing)
                    .innerJoin(schema_1.room, (0, drizzle_orm_1.eq)(schema_1.roomPricing.roomTypeId, schema_1.room.id))
                    .groupBy((0, drizzle_orm_1.sql) `${schema_1.room.hotel_id}, ${schema_1.roomPricing.currency}`)
                    .as('room_prices');
                const postData = yield database_1.database
                    .select({
                    id: schema_1.hotelPosts.id,
                    post_caption: schema_1.hotelPosts.caption,
                    hotel_id: schema_1.hotelPosts.hotel_id,
                    hotel_name: schema_1.hotels.name,
                    postDescription: schema_1.hotelPosts.postDescription,
                    url: schema_1.hotelPosts.url,
                    created_at: schema_1.hotelPosts.created_at,
                    updated_at: schema_1.hotelPosts.updated_at,
                    base_price: roomPrices.base_price,
                    currency: roomPrices.currency,
                    avg_rating: reviewStats.avg_rating,
                    review_count: reviewStats.review_count
                })
                    .from(schema_1.hotelPosts)
                    .innerJoin(schema_1.hotels, (0, drizzle_orm_1.eq)(schema_1.hotelPosts.hotel_id, schema_1.hotels.id))
                    .leftJoin(reviewStats, (0, drizzle_orm_1.eq)(schema_1.hotels.id, reviewStats.hotel_id))
                    .leftJoin(roomPrices, (0, drizzle_orm_1.eq)(schema_1.hotels.id, roomPrices.hotel_id))
                    .orderBy(schema_1.hotelPosts.created_at);
                // Format the results to handle null values and apply proper types
                const formattedPostData = postData.map(post => (Object.assign(Object.assign({}, post), { avg_rating: post.avg_rating ? parseFloat(post.avg_rating) : 0, review_count: post.review_count ? parseInt(post.review_count) : 0, base_price: post.base_price ? parseFloat(post.base_price) : 0, currency: post.currency || 'USD' })));
                return {
                    data: formattedPostData,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "All hotel posts retrieved successfully"
                };
            }
            catch (error) {
                console.error('Error fetching hotel posts with additional data:', error);
                return {
                    data: '',
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    getHotelPostById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postData = yield database_1.database
                    .select({
                    id: schema_1.hotelPosts.id,
                    post_caption: schema_1.hotelPosts.caption,
                    hotel_id: schema_1.hotelPosts.hotel_id,
                    hotel_name: schema_1.hotels.name,
                    postDescription: schema_1.hotelPosts.postDescription,
                    url: schema_1.hotelPosts.url,
                    created_at: schema_1.hotelPosts.created_at,
                    updated_at: schema_1.hotelPosts.updated_at,
                })
                    .from(schema_1.hotelPosts)
                    .innerJoin(schema_1.hotels, (0, drizzle_orm_1.eq)(schema_1.hotelPosts.hotel_id, schema_1.hotels.id))
                    .orderBy(schema_1.hotelPosts.created_at)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotelPosts.hotel_id, schema_1.hotels.id));
                return {
                    data: postData,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "All hotel posts retrieved successfully"
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
    deleteHotelPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const post_id = req.params.postId;
            try {
                const deletedPost = yield database_1.database
                    .delete(schema_1.hotelPosts)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotelPosts.id, post_id))
                    .returning()
                    .then((rows) => rows[0]);
                return {
                    data: deletedPost,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Hotel post deleted successfully"
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
}
exports.hotelPostRepository = new HotelPostRepo();
