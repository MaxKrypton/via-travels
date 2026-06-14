"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Backend/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = require("dotenv");
const auth_1 = require("./src/routes/auth");
const Hotels_basic_data_1 = require("./src/routes/Hotels.basic-data");
const Hotels_rooms_1 = require("./src/routes/Hotels.rooms");
const Hotels_pricing_availability_1 = require("./src/routes/Hotels.pricing-availability");
const Hotels_price_modifiers_1 = require("./src/routes/Hotels.price-modifiers");
const Hotel_booking_1 = require("./src/routes/Hotel.booking");
const Hotel_user_reviews_1 = require("./src/routes/Hotel.user-reviews");
const profile_1 = require("./src/routes/profile");
const authMiddleware_1 = require("./src/middleware/authMiddleware");
const Hotel_media_1 = require("./src/routes/Hotel.media");
const Hotel_posts_1 = require("./src/routes/Hotel.posts");
const Content_videos_1 = require("./src/routes/Content.videos");
const Client_complaints_1 = require("./src/routes/Client.complaints");
const invitations_1 = require("./src/routes/invitations");
const payment_routes_1 = require("./src/routes/payment.routes");
const bookings_1 = require("./src/routes/bookings");
const hotelAuth_1 = __importDefault(require("./src/routes/hotelAuth"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        flutterwaveConfigured: !!(process.env.FLW_PUBLIC_KEY && process.env.FLW_SECRET_KEY),
        emailConfigured: !!process.env.FROM_EMAIL,
        mailjetConfigured: !!(process.env.Node_MailJet_APIKEY_PUBLIC && process.env.Node_MailJet_APIKEY_PRIVATE)
    });
});
// Routes
app.get('/api/v1/test', (req, res) => {
    res.json({ message: 'Welcome to Hotel Booking API' });
});
app.use('/api/v1/auth', auth_1.authRoutes);
app.use('/api/v1/hotel-auth', hotelAuth_1.default);
app.use('/api/v1/profile', profile_1.ProfileRoute);
app.use('/api/v1/hotels', Hotels_basic_data_1.HotelBasicDataRoutes);
app.use('/api/v1/hotels/rooms', Hotels_rooms_1.HotelRoomsRoutes);
app.use('/api/v1/hotels/availability', Hotels_pricing_availability_1.HotelPricingAvailabilityRoutes);
app.use('/api/v1/hotels/discounts', Hotels_price_modifiers_1.HotelPriceModifiersRoutes);
app.use('/api/v1/hotels/booking', Hotel_booking_1.BookingRoutes);
app.use('/api/v1/hotels/reviews', Hotel_user_reviews_1.ReviewRoute);
app.use('/api/v1/hotels/Media', Hotel_media_1.HotelMediaRoute);
app.use('/api/v1/hotels/posts', Hotel_posts_1.HotelPostRoute);
app.use('/api/v1/content/videos', Content_videos_1.VideoRoute);
app.use('/api/v1/complaints', authMiddleware_1.authMiddleware, Client_complaints_1.complaintsRoutes);
app.use('/api/v1/invitation', authMiddleware_1.authMiddleware, invitations_1.InvitationRoutes);
// Payment routes
app.use('/api/v1/payment', payment_routes_1.PaymentRoutes);
// User bookings routes - NEW
app.use('/api/v1/my-bookings', bookings_1.bookingRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
    console.log(`📧 Email service: ${process.env.FROM_EMAIL || '❌ NOT CONFIGURED'}`);
    console.log(`🔑 Mailjet Keys: ${process.env.Node_MailJet_APIKEY_PUBLIC ? '✅ Configured' : '❌ Missing'}`);
    console.log(`💳 Flutterwave: ${process.env.FLW_PUBLIC_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
