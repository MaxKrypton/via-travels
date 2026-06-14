// Backend/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
import { authRoutes } from './src/routes/auth';
import { HotelBasicDataRoutes } from './src/routes/Hotels.basic-data';
import { HotelRoomsRoutes } from './src/routes/Hotels.rooms';
import { HotelPricingAvailabilityRoutes } from './src/routes/Hotels.pricing-availability';
import { HotelPriceModifiersRoutes } from './src/routes/Hotels.price-modifiers';
import { BookingRoutes } from './src/routes/Hotel.booking';
import { ReviewRoute } from './src/routes/Hotel.user-reviews';
import { ProfileRoute } from './src/routes/profile';
import { authMiddleware } from './src/middleware/authMiddleware';
import { HotelMediaRoute } from './src/routes/Hotel.media';
import { HotelPostRoute } from './src/routes/Hotel.posts';
import { VideoRoute } from './src/routes/Content.videos';
import { complaintsRoutes } from './src/routes/Client.complaints';
import { InvitationRoutes } from './src/routes/invitations';
import { PaymentRoutes } from './src/routes/payment.routes';
import { bookingRoutes } from './src/routes/bookings';
import hotelAuthRoutes from './src/routes/hotelAuth';
import { TourismRoutes } from './src/routes/Tourism';
config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
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
app.get('/api/v1/test', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Hotel Booking API' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hotel-auth', hotelAuthRoutes);
app.use('/api/v1/profile', ProfileRoute);
app.use('/api/v1/hotels', HotelBasicDataRoutes);
app.use('/api/v1/hotels/rooms', HotelRoomsRoutes);
app.use('/api/v1/hotels/availability', HotelPricingAvailabilityRoutes);
app.use('/api/v1/hotels/discounts', HotelPriceModifiersRoutes);
app.use('/api/v1/hotels/booking', BookingRoutes);
app.use('/api/v1/hotels/reviews', ReviewRoute);
app.use('/api/v1/hotels/Media', HotelMediaRoute);
app.use('/api/v1/hotels/posts', HotelPostRoute);
app.use('/api/v1/content/videos', VideoRoute);
app.use('/api/v1/complaints', authMiddleware, complaintsRoutes);
app.use('/api/v1/invitation', authMiddleware, InvitationRoutes);

// Payment routes
app.use('/api/v1/payment', PaymentRoutes);

// User bookings routes - NEW
app.use('/api/v1/my-bookings', bookingRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
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

app.use('/api/v1/tourism', TourismRoutes);