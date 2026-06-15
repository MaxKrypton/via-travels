"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoute = void 0;
// routes/reviews.ts
const express_1 = require("express");
const Hotel_user_reviews_1 = require("../services/Hotel.user-reviews");
const multer_1 = require("../utils/config/multer");
const authMiddleware_1 = require("../middleware/authMiddleware");
const contentAwareImageMiddleware_1 = __importDefault(require("../middleware/contentAwareImageMiddleware"));
const RolesAndPermissions_1 = require("../middleware/RolesAndPermissions");
exports.ReviewRoute = (0, express_1.Router)();
// Get all reviews
exports.ReviewRoute.get('/all-reviews', (req, res) => {
    return Hotel_user_reviews_1.reviewService.getAllReviews(req, res);
});
// Get all reviews for a specific hotel
exports.ReviewRoute.get('/hotel/:hotelId', (req, res) => {
    return Hotel_user_reviews_1.reviewService.getSpecificHotelReview(req, res);
});
// Get a specific review
exports.ReviewRoute.get('/:reviewId', (req, res) => {
    return Hotel_user_reviews_1.reviewService.getSpecificReview(req, res);
});
// Create a review
exports.ReviewRoute.post('/create/:hotelId/', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerNotPermitted, multer_1.upload.single('media'), (0, contentAwareImageMiddleware_1.default)({
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 85
}), (req, res) => {
    return Hotel_user_reviews_1.reviewService.createReview(req, res);
});
// Update a review
exports.ReviewRoute.patch('/update/:reviewId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerNotPermitted, (req, res) => {
    return Hotel_user_reviews_1.reviewService.updateReview(req, res);
});
// Delete a review
exports.ReviewRoute.delete('/delete/:reviewId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerNotPermitted, (req, res) => {
    return Hotel_user_reviews_1.reviewService.deleteReview(req, res);
});
