import { Router, Request, Response } from "express";
import { HotelService } from "../services/Hotels.basic-data";
import { MulterRequest } from "../utils/config/multer";
import { authMiddleware } from "../middleware/authMiddleware";
import { rolesAndPermissions } from "../middleware/RolesAndPermissions";
export const HotelBasicDataRoutes = Router();

// Get all Hotel Profiles
HotelBasicDataRoutes.get('/all-hotels', (req: Request, res: Response) => {
  return HotelService.getAllHotels(req, res)
});

// Get Specific Hotel Profile
HotelBasicDataRoutes.get('/profile/:hotelId', (req: Request, res: Response) => {
  return HotelService.getSpecificHotel(req, res)
});

// Register Hotel Profile
HotelBasicDataRoutes.post('/register', authMiddleware, rolesAndPermissions.viaAdminOnly, (req: Request, res: Response) => {
  return HotelService.registerHotel(req as MulterRequest, res)
});

// Update Hotel Profile
HotelBasicDataRoutes.patch('/update/:hotelId', authMiddleware, rolesAndPermissions.hotelManagerOrAdminPermitted, (req: Request, res: Response) => {
  return HotelService.updateHotel(req as MulterRequest, res)
});

// Delete Hotel Profile
HotelBasicDataRoutes.delete('/delete/:hotelId', authMiddleware, rolesAndPermissions.hotelManagerOrAdminPermitted, (req: Request, res: Response) => {
  return HotelService.deleteSpecificHotel(req, res)
});

