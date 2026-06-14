import { profileRepository } from '../repository/profile';
import { Request, Response } from "express";
import { profileDataTypes, updateProfileDataTypes } from "../utils/types";
import { HttpStatusCodes } from "../utils/helpers";
import { MulterRequest } from '../utils/config/multer';

class ProfileService {
  async registerProfile(req: MulterRequest, res: Response): Promise<Response> {
    try {
      const profileData: profileDataTypes = req.body;
      // send the data to profile Repository
      const { data, status, message } = await profileRepository.registerProfile(req as MulterRequest, res, profileData);

      if (status as number === HttpStatusCodes.OK) {
        return res.status(status).json({
          message,
          data
        })
      } else {
        return res.status(status).json({
          message,
          data
        })
      }
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      })
    }
  }

  async updateProfile(req: MulterRequest, res: Response): Promise<Response> {
    try {
      const profileData: updateProfileDataTypes = req.body;
      // send the data to profile Repository
      const { data, status, message } = await profileRepository.updateProfile(req as MulterRequest, res, profileData);

      if (status === HttpStatusCodes.OK) {
        return res.status(status).json({
          message,
          data
        })
      } else {
        return res.status(status).json({
          message,
          data
        })
      }
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      })
    }
  }

  async getSpecificProfile(req: Request, res: Response): Promise<Response> {
    try {
      // send the data to profile Repository
      const { data, status, message } = await profileRepository.getSingleProfile(req, res);

      if (status === HttpStatusCodes.OK) {
        return res.status(status).json({
          message,
          data
        })
      } else {
        return res.status(status).json({
          message,
          data
        })
      }
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      })
    }
  }

  async getAllProfile(req: Request, res: Response): Promise<Response> {
    try {
      // send the data to profile Repository
      const { data, status, message } = await profileRepository.getAllProfile(req, res);
      if (status === HttpStatusCodes.OK) {
        return res.status(status).json({
          message,
          data
        })
      } else {
        return res.status(status).json({
          message,
          data
        })
      }
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      })
    }
  }

  async deleteProfile(req: Request, res: Response): Promise<Response> {
    try {
      // send the data to profile Repository
      const { data, status, message } = await profileRepository.deleteProfile(req, res);
      if (status === HttpStatusCodes.OK) {
        return res.status(status).json({
          message,
          data
        })
      } else {
        return res.status(status).json({
          message,
          data
        })
      }
    } catch (error) {
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `Server error, ${error}`
      })
    }
  }
}

export const profileService = new ProfileService()
