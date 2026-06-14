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
exports.hotelMediaRepository = void 0;
const helpers_1 = require("../utils/helpers");
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const File_upload_1 = __importDefault(require("./File.upload"));
class HotelMediaRepo {
    uploadMedia(req, res, mediaData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.file) {
                    return {
                        message: "No media file provided",
                        data: '',
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST
                    };
                }
                const mediaUrl = yield File_upload_1.default.uploadFileToS3(req.file);
                if (typeof mediaUrl !== 'string') {
                    return {
                        message: "Failed to upload media",
                        data: '',
                        status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                    };
                }
                const data = Object.assign(Object.assign({}, mediaData), { url: mediaUrl, created_at: new Date(), updated_at: new Date() });
                const createdMedia = yield database_1.database
                    .insert(schema_1.hotelMedia)
                    .values(data)
                    .returning();
                return {
                    data: createdMedia[0],
                    status: helpers_1.HttpStatusCodes.CREATED,
                    message: "Hotel Media Uploaded Successfully"
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
    updateMedia(req, res, mediaData) {
        return __awaiter(this, void 0, void 0, function* () {
            const media_id = req.params.mediaId;
            try {
                if (!req.file) {
                    return {
                        message: "No media file provided",
                        data: '',
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST
                    };
                }
                const mediaUrl = yield File_upload_1.default.uploadFileToS3(req.file);
                if (typeof mediaUrl !== 'string') {
                    return {
                        message: "Failed to upload media",
                        data: '',
                        status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                    };
                }
                const data = Object.assign(Object.assign({}, mediaData), { url: mediaUrl, updated_at: new Date() });
                const updatedMedia = yield database_1.database
                    .update(schema_1.hotelMedia)
                    .set(data)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotelMedia.id, media_id))
                    .returning()
                    .then((rows) => rows[0]);
                return {
                    data: updatedMedia,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Hotel Media Updated Successfully"
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
    getHotelMedia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hotel_id = req.params.hotelId;
                const mediaData = yield database_1.database
                    .select()
                    .from(schema_1.hotelMedia)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotelMedia.hotel_id, hotel_id))
                    .innerJoin(schema_1.hotels, (0, drizzle_orm_1.eq)(schema_1.hotelMedia.hotel_id, schema_1.hotels.id));
                return {
                    data: mediaData,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Hotel Media Retrieved Successfully"
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
    deleteMedia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const media_id = req.params.mediaId;
            try {
                const deletedMedia = yield database_1.database
                    .delete(schema_1.hotelMedia)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotelMedia.id, media_id))
                    .returning()
                    .then((rows) => rows[0]);
                return {
                    data: deletedMedia,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: "Hotel Media Deleted Successfully"
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
exports.hotelMediaRepository = new HotelMediaRepo();
