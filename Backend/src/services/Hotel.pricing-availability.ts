import { Request, Response } from "express";
import { roomOperationsRepository } from "../repository/Hotel.pricing-availability";
import { MulterRequest } from "../utils/config/multer";
import { HttpStatusCodes } from '../utils/helpers';


class RoomOperations {
  async createRoomPricing(req: Request, res: Response): Promise<Response> {
    try {
      const { data, message, status } = await roomOperationsRepository.createRoomTypePricing(req);
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

  async getRoomPricingByRoomId(req: Request, res: Response) {
    try {
      const { data, message, status } = await roomOperationsRepository.getRoomTypePricingByroomTypeId(req);
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

  async updateRoomPricing(req: MulterRequest, res: Response) {
    try {
      const { data, message, status } = await roomOperationsRepository.updateRoomTypePricing(req);
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

  async deleteRoomPricing(req: Request, res: Response) {
    try {
      const { data, message, status } = await roomOperationsRepository.deleteRoomTypePricing(req);
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

  async getRoomAvailability(req: Request, res: Response) {
    try {
      const { data, message, status } = await roomOperationsRepository.getRoomTypeAvailability(req);
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

export const RoomOperationService = new RoomOperations()

