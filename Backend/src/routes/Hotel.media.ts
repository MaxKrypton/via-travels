// routes/hotelMedia.ts
import { Request, Response, Router } from "express";
import { hotelMediaService } from "../services/Hotel.media";
import { MulterRequest, upload } from "../utils/config/multer";
import { authMiddleware } from "../middleware/authMiddleware";
import contentAwareImageMiddleware from "../middleware/contentAwareImageMiddleware";
import { rolesAndPermissions } from "../middleware/RolesAndPermissions";

export const HotelMediaRoute = Router();

// Get all media for a hotel
HotelMediaRoute.get('/hotel/:hotelId', (req: Request, res: Response) => {
  return hotelMediaService.getHotelMedia(req, res);
});

// Upload media
HotelMediaRoute.post('/upload/:hotelId', upload.single('media'), contentAwareImageMiddleware({
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 85
}), authMiddleware, rolesAndPermissions.customerNotPermitted, (req: Request, res: Response) => {
  return hotelMediaService.uploadMedia(req as MulterRequest, res);
});

// Update media details
HotelMediaRoute.patch('/update/:mediaId', authMiddleware, rolesAndPermissions.customerNotPermitted, contentAwareImageMiddleware({
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 85
}), (req: Request, res: Response) => {
  return hotelMediaService.updateMedia(req, res);
});

// Delete media
HotelMediaRoute.delete('/delete/:mediaId', authMiddleware, rolesAndPermissions.customerNotPermitted, (req: Request, res: Response) => {
  return hotelMediaService.deleteMedia(req, res);
});
