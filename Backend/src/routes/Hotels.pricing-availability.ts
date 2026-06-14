import { Router, Request, Response } from "express";
import { RoomOperationService } from "../services/Hotel.pricing-availability";
import { MulterRequest } from "../utils/config/multer";
import { authMiddleware } from "../middleware/authMiddleware";
import { rolesAndPermissions } from "../middleware/RolesAndPermissions";
export const HotelPricingAvailabilityRoutes = Router();

// Room Pricing Operations
HotelPricingAvailabilityRoutes.get('/roomPricing/:roomTypeId', (req: Request, res: Response) => {
  return RoomOperationService.getRoomPricingByRoomId(req, res)
});

HotelPricingAvailabilityRoutes.post('/roomPricing/:roomTypeId', authMiddleware, (req: Request, res: Response) => {
  return RoomOperationService.createRoomPricing(req, res)
});

HotelPricingAvailabilityRoutes.patch('/roomPricing/:roomTypeId/:pricingId', authMiddleware, rolesAndPermissions.hotelManagerOrAdminPermitted, (req: Request, res: Response) => {
  return RoomOperationService.updateRoomPricing(req as MulterRequest, res)
});

HotelPricingAvailabilityRoutes.delete('/roomPricing/:roomTypeId/:pricingId', authMiddleware, rolesAndPermissions.hotelManagerOrAdminPermitted, (req: Request, res: Response) => {
  return RoomOperationService.deleteRoomPricing(req as MulterRequest, res)
});

// Room Availability
HotelPricingAvailabilityRoutes.post('/roomAvailability/:roomTypeId', (req: Request, res: Response) => {
  return RoomOperationService.getRoomAvailability(req, res)
});
