// Routes (booking.routes.ts)
import { Router, Request, Response } from "express";
import { BookingService } from "../services/Hotel.booking";
import { bookingRepository } from "../repository/Hotel.booking";
import { HttpStatusCode } from "axios";
import { authMiddleware } from "../middleware/authMiddleware";
import { hotelAuthMiddleware } from "../middleware/hotelAuthMiddleware";

export const BookingRoutes = Router();

BookingRoutes.post('/create/:hotelId', authMiddleware, (req: Request, res: Response) => {
  return BookingService.createBooking(req, res);
});

// Verify payment status for a booking
BookingRoutes.get('/:booking_id/verify-payment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await bookingRepository.verifyBookingPayment(req);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(HttpStatusCode.InternalServerError).json({
      data: null,
      message: 'Internal server error',
      status: 500
    });
  }
});

BookingRoutes.get('/user/:userId', authMiddleware, (req: Request, res: Response) => {
  return BookingService.getUserBookings(req, res);
});

BookingRoutes.get('/:bookingId', authMiddleware, (req: Request, res: Response) => {
  return BookingService.getSpecificBooking(req, res);
});

BookingRoutes.patch('/update/:bookingId', authMiddleware, (req: Request, res: Response) => {
  return BookingService.updateBooking(req, res);
});

BookingRoutes.patch('/cancel/:bookingId', authMiddleware, (req: Request, res: Response) => {
  return BookingService.cancelBooking(req, res);
});

BookingRoutes.get('/', hotelAuthMiddleware, (req: Request, res: Response) => {
  return BookingService.getHotelBookings(req, res);
});

