import { Router, Request, Response } from "express";
import { HotelRoomService } from "../services/Hotel.room";
import { MulterRequest } from "../utils/config/multer";
import { authMiddleware } from "../middleware/authMiddleware";
import { rolesAndPermissions } from "../middleware/RolesAndPermissions";
export const HotelRoomsRoutes = Router();

HotelRoomsRoutes.get('/:hotelId', (req: Request, res: Response) => {
  return HotelRoomService.getRoomTypeByHotelId(req as MulterRequest, res)
});

HotelRoomsRoutes.get('/:hotelId/:roomTypeId', (req: Request, res: Response) => {
  return HotelRoomService.getSpecificRoomType(req as MulterRequest, res)
});

HotelRoomsRoutes.post('/register/:hotelId', authMiddleware, rolesAndPermissions.hotelManagerOrAdminPermitted, (req: Request, res: Response) => {
  return HotelRoomService.createRoomType(req as MulterRequest, res)
});

HotelRoomsRoutes.patch('/update/:hotelId/:roomTypeId', authMiddleware, rolesAndPermissions.hotelManagerOrAdminPermitted, (req: Request, res: Response) => {
  return HotelRoomService.updateRoomTypeDetails(req as MulterRequest, res)
});

HotelRoomsRoutes.delete('/delete/:hotelId/:roomTypeId', authMiddleware, rolesAndPermissions.hotelManagerOrAdminPermitted, (req: Request, res: Response) => {
  return HotelRoomService.deleteRoomType(req, res)
});

