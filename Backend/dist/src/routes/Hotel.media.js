"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelMediaRoute = void 0;
// routes/hotelMedia.ts
const express_1 = require("express");
const Hotel_media_1 = require("../services/Hotel.media");
const multer_1 = require("../utils/config/multer");
const authMiddleware_1 = require("../middleware/authMiddleware");
const contentAwareImageMiddleware_1 = __importDefault(require("../middleware/contentAwareImageMiddleware"));
const RolesAndPermissions_1 = require("../middleware/RolesAndPermissions");
exports.HotelMediaRoute = (0, express_1.Router)();
// Get all media for a hotel
exports.HotelMediaRoute.get('/hotel/:hotelId', (req, res) => {
    return Hotel_media_1.hotelMediaService.getHotelMedia(req, res);
});
// Upload media
exports.HotelMediaRoute.post('/upload/:hotelId', multer_1.upload.single('media'), (0, contentAwareImageMiddleware_1.default)({
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 85
}), authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.customerNotPermitted, (req, res) => {
    return Hotel_media_1.hotelMediaService.uploadMedia(req, res);
});
// Update media details
exports.HotelMediaRoute.patch('/update/:mediaId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.customerNotPermitted, (0, contentAwareImageMiddleware_1.default)({
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 85
}), (req, res) => {
    return Hotel_media_1.hotelMediaService.updateMedia(req, res);
});
// Delete media
exports.HotelMediaRoute.delete('/delete/:mediaId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.customerNotPermitted, (req, res) => {
    return Hotel_media_1.hotelMediaService.deleteMedia(req, res);
});
