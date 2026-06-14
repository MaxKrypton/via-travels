// Hotel-specific authentication routes
// Hotels login with their Hotel ID instead of email

import express from 'express';
import { Request, Response } from 'express';
import { HotelAuthenticationService } from '../services/hotelAuthService';
import { authMiddleware } from '../middleware/authMiddleware';

const Router = express.Router();
const hotelAuthService = new HotelAuthenticationService();

/**
 * POST /hotel-auth/login
 * Hotel login with Hotel ID and password
 * Body: { hotel_id: string, password: string }
 */
Router.post('/login', async (req: Request, res: Response) => {
  hotelAuthService.loginWithHotelId(req, res);
});

/**
 * POST /hotel-auth/set-password
 * Set or update hotel password (admin only)
 * Body: { hotel_id: string, new_password: string }
 */
Router.post('/set-password', authMiddleware, async (req: Request, res: Response) => {
  hotelAuthService.setHotelPassword(req, res);
});

/**
 * GET /hotel-auth/me
 * Get current hotel data (requires authentication)
 */
Router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  hotelAuthService.getHotelData(req, res);
});

export default Router;
