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
exports.reviewService = void 0;
// services/reviews.ts
const Hotel_user_reviews_1 = require("../repository/Hotel.user-reviews");
const helpers_1 = require("../utils/helpers");
class ReviewService {
    createReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotelId = req.params.hotelId;
            const bookingId = req.params.bookingId;
            try {
                // Extract the review data from request body
                const reviewData = {
                    hotel_id: hotelId,
                    rating: req.body.rating,
                    review_text: req.body.review_text,
                };
                const { data, status, message } = yield Hotel_user_reviews_1.reviewRepository.createReview(req, res, reviewData);
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
    updateReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Extract only updatable fields
                const reviewData = Object.assign(Object.assign({}, (req.body.rating && { rating: parseInt(req.body.rating) })), (req.body.review_text && { review_text: req.body.review_text }));
                const { data, status, message } = yield Hotel_user_reviews_1.reviewRepository.updateReview(req, res, reviewData);
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
    getSpecificReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Hotel_user_reviews_1.reviewRepository.getSingleReview(req, res);
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
    getSpecificHotelReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Hotel_user_reviews_1.reviewRepository.getHotelReviews(req, res);
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
    getAllReviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Hotel_user_reviews_1.reviewRepository.getAllReviews(req, res);
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
    deleteReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, status, message } = yield Hotel_user_reviews_1.reviewRepository.deleteReview(req, res);
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
exports.reviewService = new ReviewService();
