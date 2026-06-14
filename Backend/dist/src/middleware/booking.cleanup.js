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
exports.BookingCleanup = void 0;
const Hotel_booking_1 = require("../repository/Hotel.booking");
const BookingCleanup = (options = {}) => {
    const { skipRoutes = ['/health', '/status', '/metrics', '/favicon.ico', '/robots.txt'], logActivity = process.env.NODE_ENV === 'development' } = options;
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Check if we should skip this route
            if (skipRoutes.includes(req.path)) {
                return next();
            }
            // Free up the booking space
            const expiredPendingPayments = yield Hotel_booking_1.bookingRepository.processExpiredPendingPayments();
            const expiredCheckouts = yield Hotel_booking_1.bookingRepository.processExpiredCheckouts();
            // Validate that both methods returned numbers
            if (typeof expiredPendingPayments !== "number" || typeof expiredCheckouts !== "number") {
                console.error('[BookingCleanup] Invalid return types from cleanup methods:', {
                    expiredPendingPayments: typeof expiredPendingPayments,
                    expiredCheckouts: typeof expiredCheckouts,
                    path: req.path,
                    timestamp: new Date().toISOString()
                });
                // Don't fail the request, just log the error and continue
                // This prevents cleanup issues from breaking user requests
                return next();
            }
            // Log activity if enabled and there were cleanups
            if (logActivity && (expiredPendingPayments > 0 || expiredCheckouts > 0)) {
                console.log(`[BookingCleanup] Processed ${expiredPendingPayments} expired payments and ${expiredCheckouts} expired checkouts on ${req.method} ${req.path}`);
            }
            // Continue to next middleware
            next();
        }
        catch (error) {
            console.error('[BookingCleanup] Error during cleanup process:', {
                error: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });
            // Don't fail the request due to cleanup errors
            // The user's request should still be processed even if cleanup fails
            next();
        }
    });
};
exports.BookingCleanup = BookingCleanup;
