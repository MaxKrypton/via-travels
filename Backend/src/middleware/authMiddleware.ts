import { NextFunction, Request, Response } from "express"
import { HttpStatusCodes, SECRETS } from "../utils/helpers";
import jwt from 'jsonwebtoken';
import { AuthenticationRepository } from "../repository/User";

// Extend the Express Request type to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        email_verified: boolean;
        username: string;
        preferred_language: string;
        preferred_currency: string;
        phone_number: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.access_token;
    if (!token) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        message: "Access denied. No Token Provided"
      });
    }

    try {
      const decoded = jwt.verify(token, SECRETS.ACCESS_TOKEN_SECRET) as { email: string };
      console.log('Decoded token:', decoded);

      const authRepository = new AuthenticationRepository();
      const user = await authRepository.findUserByEmailForAuth(decoded.email);
      console.log('Found user:', user);

      if (!user) {
        console.log('No user found for email:', decoded.email);
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified,
        username: user.username,
        preferred_currency: user.preferred_currency,
        preferred_language: user.preferred_language,
        phone_number: user.phone_number
      };

      next();
    } catch (jwtError) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Invalid token', jwtError });
    }
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred', error });
  }
};
