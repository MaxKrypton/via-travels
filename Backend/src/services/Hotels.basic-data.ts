import { DataResponse, updateProfileDataTypes } from '../utils/types';
import { Request, Response } from "express";
import { hotelRepository } from "../repository/Hotels.basic-data";
import { MulterRequest } from "../utils/config/multer";
import { HttpStatusCodes } from '../utils/helpers';


class Hotels {
  async getAllHotels(req: Request, res: Response): Promise<Response> {
    try {
      const { data, message, status } = await hotelRepository.getAllHotels();
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

  async getSpecificHotel(req: Request, res: Response) {
    try {
      const { data, message, status } = await hotelRepository.getSpecificHotel(req);
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

  async registerHotel(req: MulterRequest, res: Response) {
    try {
      const { data, message, status } = await hotelRepository.createHotel(req);
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

  async updateHotel(req: MulterRequest, res: Response) {
    try {
      const { data, message, status } = await hotelRepository.updateHotel(req);
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

  async deleteSpecificHotel(req: Request, res: Response) {
    try {
      const { data, message, status } = await hotelRepository.deleteHotel(req);
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

export const HotelService = new Hotels()

