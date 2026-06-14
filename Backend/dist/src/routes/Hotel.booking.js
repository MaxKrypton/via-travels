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
exports.BookingRoutes = void 0;
// Routes (booking.routes.ts)
const express_1 = require("express");
const Hotel_booking_1 = require("../services/Hotel.booking");
const Hotel_booking_2 = require("../repository/Hotel.booking");
const axios_1 = require("axios");
const authMiddleware_1 = require("../middleware/authMiddleware");
const hotelAuthMiddleware_1 = require("../middleware/hotelAuthMiddleware");
exports.BookingRoutes = (0, express_1.Router)();
exports.BookingRoutes.post('/create/:hotelId', authMiddleware_1.authMiddleware, (req, res) => {
    return Hotel_booking_1.BookingService.createBooking(req, res);
});
// Verify payment status for a booking
exports.BookingRoutes.get('/:booking_id/verify-payment', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield Hotel_booking_2.bookingRepository.verifyBookingPayment(req);
        return res.status(result.status).json(result);
    }
    catch (error) {
        return res.status(axios_1.HttpStatusCode.InternalServerError).json({
            data: null,
            message: 'Internal server error',
            status: 500
        });
    }
}));
exports.BookingRoutes.get('/user/:userId', authMiddleware_1.authMiddleware, (req, res) => {
    return Hotel_booking_1.BookingService.getUserBookings(req, res);
});
exports.BookingRoutes.get('/:bookingId', authMiddleware_1.authMiddleware, (req, res) => {
    return Hotel_booking_1.BookingService.getSpecificBooking(req, res);
});
exports.BookingRoutes.patch('/update/:bookingId', authMiddleware_1.authMiddleware, (req, res) => {
    return Hotel_booking_1.BookingService.updateBooking(req, res);
});
exports.BookingRoutes.patch('/cancel/:bookingId', authMiddleware_1.authMiddleware, (req, res) => {
    return Hotel_booking_1.BookingService.cancelBooking(req, res);
});
exports.BookingRoutes.get('/', hotelAuthMiddleware_1.hotelAuthMiddleware, (req, res) => {
    return Hotel_booking_1.BookingService.getHotelBookings(req, res);
});
