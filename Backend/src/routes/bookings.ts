// Backend/src/routes/bookings.ts

import express, { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';
import { authMiddleware } from '../middleware/authMiddleware';

const Router = express.Router();
const bookingService = new BookingService();

// All routes require authentication
Router.use(authMiddleware);

// Get all bookings for user (with optional status filter)
// Query params: ?status=upcoming|completed|cancelled|all
Router.get('/', async (req: Request, res: Response) => {
  await bookingService.getUserBookings(req, res);
});

// Get upcoming bookings
Router.get('/upcoming', async (req: Request, res: Response) => {
  await bookingService.getUpcomingBookings(req, res);
});

// Get completed bookings
Router.get('/completed', async (req: Request, res: Response) => {
  await bookingService.getCompletedBookings(req, res);
});

// Get specific booking details
Router.get('/:bookingId', async (req: Request, res: Response) => {
  await bookingService.getBookingDetails(req, res);
});

// Get invoice for a booking
Router.get('/:bookingId/invoice', async (req: Request, res: Response) => {
  await bookingService.getBookingInvoice(req, res);
});

export const bookingRoutes = Router;
