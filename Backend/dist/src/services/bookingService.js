"use strict";
// Backend/src/services/bookingService.ts
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
exports.BookingService = void 0;
const helpers_1 = require("../utils/helpers");
const Booking_1 = require("../repository/Booking");
class BookingService {
    constructor() {
        this.repository = new Booking_1.BookingRepository();
    }
    // Get all bookings for a user (with filters)
    getUserBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { status } = req.query; // 'completed', 'upcoming', 'cancelled', 'all'
                if (!userId) {
                    return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                        success: false,
                        message: 'User not authenticated'
                    });
                }
                const bookings = yield this.repository.getUserBookings(userId, status);
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    success: true,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: 'Bookings retrieved successfully',
                    data: {
                        bookings
                    }
                });
            }
            catch (error) {
                console.error('Error fetching user bookings:', error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                    message: 'Failed to fetch bookings',
                    error: error.message
                });
            }
        });
    }
    // Get upcoming bookings (check-in date in the future)
    getUpcomingBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                        success: false,
                        message: 'User not authenticated'
                    });
                }
                const bookings = yield this.repository.getUpcomingBookings(userId);
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    success: true,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: 'Upcoming bookings retrieved successfully',
                    data: {
                        count: bookings.length,
                        bookings
                    }
                });
            }
            catch (error) {
                console.error('Error fetching upcoming bookings:', error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                    message: 'Failed to fetch upcoming bookings',
                    error: error.message
                });
            }
        });
    }
    // Get completed bookings (check-out date in the past)
    getCompletedBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                        success: false,
                        message: 'User not authenticated'
                    });
                }
                const bookings = yield this.repository.getCompletedBookings(userId);
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    success: true,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: 'Completed bookings retrieved successfully',
                    data: {
                        count: bookings.length,
                        bookings
                    }
                });
            }
            catch (error) {
                console.error('Error fetching completed bookings:', error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                    message: 'Failed to fetch completed bookings',
                    error: error.message
                });
            }
        });
    }
    // Get invoice for a specific booking
    getBookingInvoice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { bookingId } = req.params;
                if (!userId) {
                    return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                        success: false,
                        message: 'User not authenticated'
                    });
                }
                if (!bookingId) {
                    return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                        success: false,
                        message: 'Booking ID is required'
                    });
                }
                const invoice = yield this.repository.generateInvoice(bookingId, userId);
                if (!invoice) {
                    return res.status(helpers_1.HttpStatusCodes.NOT_FOUND).json({
                        success: false,
                        message: 'Booking not found or you do not have access to this booking'
                    });
                }
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    success: true,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: 'Invoice generated successfully',
                    data: {
                        invoice
                    }
                });
            }
            catch (error) {
                console.error('Error generating invoice:', error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                    message: 'Failed to generate invoice',
                    error: error.message
                });
            }
        });
    }
    // Get booking details
    getBookingDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { bookingId } = req.params;
                if (!userId) {
                    return res.status(helpers_1.HttpStatusCodes.UNAUTHORIZED).json({
                        success: false,
                        message: 'User not authenticated'
                    });
                }
                const booking = yield this.repository.getBookingById(bookingId, userId);
                if (!booking) {
                    return res.status(helpers_1.HttpStatusCodes.NOT_FOUND).json({
                        success: false,
                        message: 'Booking not found'
                    });
                }
                return res.status(helpers_1.HttpStatusCodes.OK).json({
                    success: true,
                    status: helpers_1.HttpStatusCodes.OK,
                    message: 'Booking details retrieved successfully',
                    data: {
                        booking
                    }
                });
            }
            catch (error) {
                console.error('Error fetching booking details:', error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                    message: 'Failed to fetch booking details',
                    error: error.message
                });
            }
        });
    }
}
exports.BookingService = BookingService;
