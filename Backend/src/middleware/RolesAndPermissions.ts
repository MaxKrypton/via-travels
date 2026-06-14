import { NextFunction, Request, Response } from "express";
import { HttpStatusCodes } from "../utils/helpers";

export enum UserRole {
  CUSTOMER = 'customer',
  HOTEL_MANAGER = 'hotel-manager',
  VIA_ADMIN = 'via-admin',
}

export class PrivilegeMiddleware {
  customerPermitted(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role === UserRole.CUSTOMER) {
      return next();
    }
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Only guests can access this resource' });
  }

  customerNotPermitted(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role === UserRole.CUSTOMER) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Guests are not allowed to perform this action' });
    }
    return next();
  }

  hotelManagerPermitted(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role === UserRole.HOTEL_MANAGER) {
      return next();
    }
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Only hotel managers can access this resource' });
  }

  hotelManagerNotPermitted(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role === UserRole.HOTEL_MANAGER) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Hotel Managers are not allowed to perform this action' });
    }
    return next();
  }

  viaAdminOnly(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role === UserRole.VIA_ADMIN) {
      return next();
    }
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Only via-admins can access this resource' });
  }

  hotelManagerOrAdminPermitted(req: Request, res: Response, next: NextFunction) {
    const role = req.user?.role;
    if (role === UserRole.HOTEL_MANAGER || role === UserRole.VIA_ADMIN) {
      return next();
    }
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Only hotel managers or via-admins can access this resource' });
  }
}

export const rolesAndPermissions = new PrivilegeMiddleware();
