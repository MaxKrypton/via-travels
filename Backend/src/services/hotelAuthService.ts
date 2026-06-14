// Hotel-specific authentication service
// Hotels login with their unique Hotel ID instead of email

import { Request, Response } from 'express';
import { HttpStatusCodes } from '../utils/helpers';
import { database as db } from '../utils/config/database';
import { hotels } from '../utils/config/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class HotelAuthenticationService {

  /**
   * Hotel Login with Hotel ID
   * Hotels can login using their unique hotel_id and password
   */
  async loginWithHotelId(req: Request, res: Response): Promise<Response> {
    try {
      const { hotel_id, password } = req.body;

      // Validate input
      if (!hotel_id || !password) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          status: HttpStatusCodes.BAD_REQUEST,
          message: 'Hotel ID and password are required',
        });
      }

      // Find hotel by ID
      const hotel = await db
        .select()
        .from(hotels)
        .where(eq(hotels.id, hotel_id))
        .limit(1);

      if (!hotel || hotel.length === 0) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          status: HttpStatusCodes.UNAUTHORIZED,
          message: 'Invalid Hotel ID or password',
        });
      }

      const hotelData = hotel[0];

      // Check if hotel has a password set
      if (!hotelData.access_password) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          status: HttpStatusCodes.UNAUTHORIZED,
          message: 'Hotel account not properly configured. Please contact support.',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, hotelData.access_password);

      if (!isPasswordValid) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          status: HttpStatusCodes.UNAUTHORIZED,
          message: 'Invalid Hotel ID or password',
        });
      }

      // Generate JWT token with hotel information
      const tokenSecret = process.env.ACCESS_TOKEN_SECRET as string;
      const token = jwt.sign(
        {
          hotel_id: hotelData.id,
          hotel_name: hotelData.name,
          hotel_email: hotelData.business_email,
          type: 'hotel',
        },
        tokenSecret,
        { expiresIn: '7d' }
      );

      // Set cookie
      res.cookie("access_token", token, {
        httpOnly: true,
        maxAge: 3600000 * 24 * 7 // 7 days
      });

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        status: HttpStatusCodes.OK,
        message: 'Login successful',
        data: {
          token: token,
          hotel: {
            id: hotelData.id,
            name: hotelData.name,
            email: hotelData.business_email,
            phone: hotelData.business_contact_mobile,
            address: hotelData.street_address,
            city: hotelData.city,
            country: hotelData.country,
            star_rating: hotelData.star_rating,
          }
        }
      });

    } catch (error) {
      console.error('Hotel login error:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An error occurred during login',
      });
    }
  }

  /**
   * Set or update hotel password
   * This allows admin to set initial password for hotels
   */
  async setHotelPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { hotel_id, new_password } = req.body;

      if (!hotel_id || !new_password) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Hotel ID and new password are required',
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Update hotel password
      await db
        .update(hotels)
        .set({
          access_password: hashedPassword,
          updated_at: new Date()
        })
        .where(eq(hotels.id, hotel_id));

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: 'Hotel password set successfully',
        data: {
          hotel_id: hotel_id
        }
      });

    } catch (error) {
      console.error('Set hotel password error:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'An error occurred while setting password',
      });
    }
  }

  /**
   * Get hotel data by token
   * Middleware will validate the token
   */
  async getHotelData(req: Request, res: Response): Promise<Response> {
    try {
      // Extract hotel_id from authenticated request
      const hotel_id = (req as any).hotel?.hotel_id;

      if (!hotel_id) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized access',
        });
      }

      // Get complete hotel data
      const hotel = await db
        .select()
        .from(hotels)
        .where(eq(hotels.id, hotel_id))
        .limit(1);

      if (!hotel || hotel.length === 0) {
        return res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Hotel not found',
        });
      }

      return res.status(HttpStatusCodes.OK).json({
        success: true,
        data: {
          hotel: hotel[0]
        }
      });

    } catch (error) {
      console.error('Get hotel data error:', error);
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'An error occurred',
      });
    }
  }
}
