
import { Router, Request, Response } from "express";
import { HotelPriceModifierService } from '../services/Hotel.price-modifiers'
import { authMiddleware } from "../middleware/authMiddleware";
import { rolesAndPermissions } from "../middleware/RolesAndPermissions";
export const HotelPriceModifiersRoutes = Router();

HotelPriceModifiersRoutes.post('/create/:roomTypeId', authMiddleware, rolesAndPermissions.hotelManagerOrAdminPermitted, (req: Request, res: Response) => {
  return HotelPriceModifierService.createPriceModifier(req, res)
});

HotelPriceModifiersRoutes.get('/:roomTypeId', (req: Request, res: Response) => {
  return HotelPriceModifierService.getPriceModifiersByRoomTypeId(req, res)
});


HotelPriceModifiersRoutes.get('/hot-deals', (req: Request, res: Response) => {
  return HotelPriceModifierService.getHotDeals(req, res)
});

HotelPriceModifiersRoutes.patch('/update/:roomTypeId/:discountId', authMiddleware, rolesAndPermissions.hotelManagerOrAdminPermitted, (req: Request, res: Response) => {
  return HotelPriceModifierService.updatePriceModifier(req, res)
});

HotelPriceModifiersRoutes.delete('/delete/:roomTypeId/:discountId', authMiddleware, rolesAndPermissions.hotelManagerOrAdminPermitted, (req: Request, res: Response) => {
  return HotelPriceModifierService.deletePriceModifier(req, res)
});

