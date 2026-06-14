// Backend/src/services/bookingService.ts

import { Request, Response } from 'express';
import { HttpStatusCodes } from '../utils/helpers';
import { BookingRepository } from '../repository/Booking';

export class BookingService {
  private repository: BookingRepository = new BookingRepository();

  // Get all bookings for a user (with filters)
  async getUserBookings(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { status } = req.query; // 'completed', 'upcoming', 'cancelled', 'all'

      if (!userId) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const bookings = await this.repository.getUserBookings(userId, status as string);

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        status: HttpStatusCodes.OK,
        message: 'Bookings retrieved successfully',
        data: {
          bookings
        }
      });
    } catch (error: any) {
      console.error('Error fetching user bookings:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch bookings',
        error: error.message
      });
    }
  }

  // Get upcoming bookings (check-in date in the future)
  async getUpcomingBookings(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const bookings = await this.repository.getUpcomingBookings(userId);

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        status: HttpStatusCodes.OK,
        message: 'Upcoming bookings retrieved successfully',
        data: {
          count: bookings.length,
          bookings
        }
      });
    } catch (error: any) {
      console.error('Error fetching upcoming bookings:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch upcoming bookings',
        error: error.message
      });
    }
  }

  // Get completed bookings (check-out date in the past)
  async getCompletedBookings(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const bookings = await this.repository.getCompletedBookings(userId);

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        status: HttpStatusCodes.OK,
        message: 'Completed bookings retrieved successfully',
        data: {
          count: bookings.length,
          bookings
        }
      });
    } catch (error: any) {
      console.error('Error fetching completed bookings:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch completed bookings',
        error: error.message
      });
    }
  }

  // Get invoice for a specific booking
  async getBookingInvoice(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { bookingId } = req.params;

      if (!userId) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!bookingId) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Booking ID is required'
        });
      }

      const invoice = await this.repository.generateInvoice(bookingId, userId);

      if (!invoice) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Booking not found or you do not have access to this booking'
        });
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        status: HttpStatusCodes.OK,
        message: 'Invoice generated successfully',
        data: {
          invoice
        }
      });
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to generate invoice',
        error: error.message
      });
    }
  }

  // Get booking details
  async getBookingDetails(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { bookingId } = req.params;

      if (!userId) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const booking = await this.repository.getBookingById(bookingId, userId);

      if (!booking) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Booking not found'
        });
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        status: HttpStatusCodes.OK,
        message: 'Booking details retrieved successfully',
        data: {
          booking
        }
      });
    } catch (error: any) {
      console.error('Error fetching booking details:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch booking details',
        error: error.message
      });
    }
  }
}
