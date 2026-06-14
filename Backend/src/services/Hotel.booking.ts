// Services (booking.service.ts)
import { Request, Response } from "express";
import { bookingRepository } from "../repository/Hotel.booking";
import { HttpStatusCodes } from '../utils/helpers';

class Booking {
  async createBooking(req: Request, res: Response): Promise<Response> {
    try {
      const { data, message, status } = await bookingRepository.createBooking(req);
      return res.status(status).json({
        message: message,
        data: data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error
      });
    }
  }

  async getUserBookings(req: Request, res: Response): Promise<Response> {
    try {
      const { data, message, status } = await bookingRepository.getUserBookings(req);
      return res.status(status).json({
        message: message,
        data: data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error
      });
    }
  }

  async getSpecificBooking(req: Request, res: Response): Promise<Response> {
    try {
      const { data, message, status } = await bookingRepository.getSpecificBooking(req);
      return res.status(status).json({
        message: message,
        data: data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error
      });
    }
  }

  async updateBooking(req: Request, res: Response): Promise<Response> {
    try {
      const { data, message, status } = await bookingRepository.updateBooking(req);
      return res.status(status).json({
        message: message,
        data: data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error
      });
    }
  }

  async cancelBooking(req: Request, res: Response): Promise<Response> {
    try {
      const { data, message, status } = await bookingRepository.cancelBooking(req);
      return res.status(status).json({
        message: message,
        data: data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error
      });
    }
  }

  async getHotelBookings(req: Request, res: Response): Promise<Response> {
    try {
      const { data, message, status } = await bookingRepository.getHotelBookings(req);
      return res.status(status).json({
        message: message,
        data: data
      });
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error
      });
    }
  }
}

export const BookingService = new Booking();
