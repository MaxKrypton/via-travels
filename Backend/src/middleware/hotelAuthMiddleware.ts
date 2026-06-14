import { NextFunction, Request, Response } from "express";
import { HttpStatusCodes, SECRETS } from "../utils/helpers";
import jwt from 'jsonwebtoken';
import { database } from '../utils/config/database';
import { hotels } from '../utils/config/schema';
import { eq } from 'drizzle-orm';

// Extend the Express Request type to include a hotel property
declare global {
  namespace Express {
    interface Request {
      hotel?: {
        id: string;
        name: string;
        email: string | null;
        type: string;
      };
    }
  }
}

export const hotelAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.access_token;
    if (!token) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        message: "Access denied. No Token Provided"
      });
    }

    try {
      const decoded = jwt.verify(token, SECRETS.ACCESS_TOKEN_SECRET) as {
        hotel_id: string;
        hotel_name: string;
        hotel_email: string | null;
        type: string;
      };

      console.log('Decoded hotel token:', decoded);

      // Verify this is a hotel token
      if (decoded.type !== 'hotel') {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: 'Invalid token type. Hotel authentication required.'
        });
      }

      // Verify hotel exists in database
      const [hotel] = await database
        .select()
        .from(hotels)
        .where(eq(hotels.id, decoded.hotel_id))
        .limit(1);

      if (!hotel) {
        console.log('No hotel found for ID:', decoded.hotel_id);
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Invalid hotel token' });
      }

      // Attach hotel info to request
      req.hotel = {
        id: hotel.id,
        name: hotel.name,
        email: hotel.business_email,
        type: 'hotel'
      };

      // Also set req.user for backwards compatibility with some endpoints
      req.user = {
        id: hotel.id,
        email: hotel.business_email || '',
        role: 'hotel',
        email_verified: true,
        username: hotel.name,
        preferred_currency: 'RWF',
        preferred_language: 'en',
        phone_number: hotel.business_contact_mobile || ''
      };

      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred', error });
  }
};
