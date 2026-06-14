import { Request, Response } from "express";
import { priceModifierOperation } from "../repository/Hotel.price-modifiers";
import { MulterRequest } from "../utils/config/multer";
import { HttpStatusCodes } from '../utils/helpers';


class HotelPriceModifiers {
  async createPriceModifier(req: Request, res: Response): Promise<Response> {
    try {
      const { data, message, status } = await priceModifierOperation.createPriceModifier(req);
      return res.status(status).json({
        message: message,
        data: data
      })

    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error
      })
    }
  }

  async getPriceModifiersByRoomTypeId(req: Request, res: Response) {
    try {
      const { data, message, status } = await priceModifierOperation.getPriceModifiersByroomTypeId(req);
      return res.status(status).json({
        message: message,
        data: data
      })

    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error
      })
    }
  }

  async getHotDeals(req: Request, res: Response) {
    try {
      const { data, message, status } = await priceModifierOperation.getHotDeals(req);
      return res.status(status).json({
        message: message,
        data: data
      })

    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error
      })
    }
  }

  async updatePriceModifier(req: Request, res: Response) {
    try {
      const { data, message, status } = await priceModifierOperation.updatePriceModifier(req);
      return res.status(status).json({
        message: message,
        data: data
      })

    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error
      })
    }
  }

  async deletePriceModifier(req: Request, res: Response) {
    try {
      const { data, message, status } = await priceModifierOperation.deletePriceModifier(req);
      return res.status(status).json({
        message: message,
        data: data
      })

    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error
      })
    }
  }
}

export const HotelPriceModifierService = new HotelPriceModifiers()

