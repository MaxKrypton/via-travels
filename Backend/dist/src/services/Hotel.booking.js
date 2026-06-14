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
exports.BookingService = void 0;
const Hotel_booking_1 = require("../repository/Hotel.booking");
const helpers_1 = require("../utils/helpers");
class Booking {
    createBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_booking_1.bookingRepository.createBooking(req);
                return res.status(status).json({
                    message: message,
                    data: data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error
                });
            }
        });
    }
    getUserBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_booking_1.bookingRepository.getUserBookings(req);
                return res.status(status).json({
                    message: message,
                    data: data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error
                });
            }
        });
    }
    getSpecificBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_booking_1.bookingRepository.getSpecificBooking(req);
                return res.status(status).json({
                    message: message,
                    data: data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error
                });
            }
        });
    }
    updateBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_booking_1.bookingRepository.updateBooking(req);
                return res.status(status).json({
                    message: message,
                    data: data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error
                });
            }
        });
    }
    cancelBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_booking_1.bookingRepository.cancelBooking(req);
                return res.status(status).json({
                    message: message,
                    data: data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error
                });
            }
        });
    }
    getHotelBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_booking_1.bookingRepository.getHotelBookings(req);
                return res.status(status).json({
                    message: message,
                    data: data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error
                });
            }
        });
    }
}
exports.BookingService = new Booking();
