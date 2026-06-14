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
exports.hotelMediaService = void 0;
// services/hotelMedia.ts
const Hotel_media_1 = require("../repository/Hotel.media");
const helpers_1 = require("../utils/helpers");
class HotelMediaService {
    uploadMedia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.file) {
                    return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        message: "No media file provided"
                    });
                }
                const mediaData = {
                    hotel_id: req.params.hotelId,
                    media_type: req.body.media_type,
                    media_category: req.body.media_category,
                };
                const { data, status, message } = yield Hotel_media_1.hotelMediaRepository.uploadMedia(req, res, mediaData);
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
    updateMedia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mediaData = Object.assign(Object.assign({}, (req.body.media_type && { media_type: req.body.media_type })), (req.body.media_category && { media_category: req.body.media_category }));
                const { data, status, message } = yield Hotel_media_1.hotelMediaRepository.updateMedia(req, res, mediaData);
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
    getHotelMedia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Hotel_media_1.hotelMediaRepository.getHotelMedia(req, res);
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
    deleteMedia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Hotel_media_1.hotelMediaRepository.deleteMedia(req, res);
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
exports.hotelMediaService = new HotelMediaService();
