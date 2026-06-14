"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelPostRoute = void 0;
const Hotel_posts_1 = require("./../services/Hotel.posts");
const express_1 = require("express");
const multer_1 = require("../utils/config/multer");
const authMiddleware_1 = require("../middleware/authMiddleware");
const contentAwareImageMiddleware_1 = __importDefault(require("../middleware/contentAwareImageMiddleware"));
const RolesAndPermissions_1 = require("../middleware/RolesAndPermissions");
exports.HotelPostRoute = (0, express_1.Router)();
// Get all posts for a hotel
exports.HotelPostRoute.get('/All-hotels', (req, res) => {
    return Hotel_posts_1.hotelPostService.getAllHotelPosts(req, res);
});
// Get all posts for a hotel
exports.HotelPostRoute.get('/:hotelId', (req, res) => {
    return Hotel_posts_1.hotelPostService.getHotelPostById(req, res);
});
// Upload Hotel Post
exports.HotelPostRoute.post('/upload/:hotelId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.customerNotPermitted, multer_1.upload.single('media'), (0, contentAwareImageMiddleware_1.default)({
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 85
}), (req, res) => {
    return Hotel_posts_1.hotelPostService.uploadPost(req, res);
});
// Update Hotel Post details
exports.HotelPostRoute.patch('/update/:postId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.customerNotPermitted, (req, res) => {
    return Hotel_posts_1.hotelPostService.updatePost(req, res);
});
// Delete media
exports.HotelPostRoute.delete('/delete/:postId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.customerNotPermitted, (req, res) => {
    return Hotel_posts_1.hotelPostService.deleteHotelPost(req, res);
});
