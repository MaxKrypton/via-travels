"use strict";
// Backend/src/routes/bookings.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const bookingService_1 = require("../services/bookingService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Router = express_1.default.Router();
const bookingService = new bookingService_1.BookingService();
// All routes require authentication
Router.use(authMiddleware_1.authMiddleware);
// Get all bookings for user (with optional status filter)
// Query params: ?status=upcoming|completed|cancelled|all
Router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield bookingService.getUserBookings(req, res);
}));
// Get upcoming bookings
Router.get('/upcoming', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield bookingService.getUpcomingBookings(req, res);
}));
// Get completed bookings
Router.get('/completed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield bookingService.getCompletedBookings(req, res);
}));
// Get specific booking details
Router.get('/:bookingId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield bookingService.getBookingDetails(req, res);
}));
// Get invoice for a booking
Router.get('/:bookingId/invoice', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield bookingService.getBookingInvoice(req, res);
}));
exports.bookingRoutes = Router;
