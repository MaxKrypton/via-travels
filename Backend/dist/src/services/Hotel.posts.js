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
exports.hotelPostService = void 0;
// services/hotelPost.ts
const Hotel_post_1 = require("../repository/Hotel.post");
const helpers_1 = require("../utils/helpers");
class HotelPostService {
    uploadPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.file) {
                    return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        message: "No media file provided"
                    });
                }
                const postData = {
                    hotel_id: req.params.hotelId,
                    caption: req.body.caption,
                    postDescription: req.body.postDescription
                };
                const { data, status, message } = yield Hotel_post_1.hotelPostRepository.uploadHotelPost(req, res, postData);
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
    updatePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postData = Object.assign(Object.assign({}, (req.body.caption && { caption: req.body.caption })), (req.body.postDescription && { postDescription: req.body.postDescription }));
                const { data, status, message } = yield Hotel_post_1.hotelPostRepository.updateHotelPost(req, res, postData);
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
    getAllHotelPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Hotel_post_1.hotelPostRepository.getAllHotelPosts(req, res);
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
    getHotelPostById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Hotel_post_1.hotelPostRepository.getHotelPostById(req, res);
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
    deleteHotelPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Hotel_post_1.hotelPostRepository.deleteHotelPost(req, res);
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
exports.hotelPostService = new HotelPostService();
