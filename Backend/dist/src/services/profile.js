"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileService = void 0;
const profile_1 = require("../repository/profile");
const helpers_1 = require("../utils/helpers");
class ProfileService {
    registerProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const profileData = req.body;
                // send the data to profile Repository
                const { data, status, message } = yield profile_1.profileRepository.registerProfile(req, res, profileData);
                if (status === helpers_1.HttpStatusCodes.OK) {
                    return res.status(status).json({
                        message,
                        data
                    });
                }
                else {
                    return res.status(status).json({
                        message,
                        data
                    });
                }
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const profileData = req.body;
                // send the data to profile Repository
                const { data, status, message } = yield profile_1.profileRepository.updateProfile(req, res, profileData);
                if (status === helpers_1.HttpStatusCodes.OK) {
                    return res.status(status).json({
                        message,
                        data
                    });
                }
                else {
                    return res.status(status).json({
                        message,
                        data
                    });
                }
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    getSpecificProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // send the data to profile Repository
                const { data, status, message } = yield profile_1.profileRepository.getSingleProfile(req, res);
                if (status === helpers_1.HttpStatusCodes.OK) {
                    return res.status(status).json({
                        message,
                        data
                    });
                }
                else {
                    return res.status(status).json({
                        message,
                        data
                    });
                }
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    getAllProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // send the data to profile Repository
                const { data, status, message } = yield profile_1.profileRepository.getAllProfile(req, res);
                if (status === helpers_1.HttpStatusCodes.OK) {
                    return res.status(status).json({
                        message,
                        data
                    });
                }
                else {
                    return res.status(status).json({
                        message,
                        data
                    });
                }
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
    deleteProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // send the data to profile Repository
                const { data, status, message } = yield profile_1.profileRepository.deleteProfile(req, res);
                if (status === helpers_1.HttpStatusCodes.OK) {
                    return res.status(status).json({
                        message,
                        data
                    });
                }
                else {
                    return res.status(status).json({
                        message,
                        data
                    });
                }
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: `Server error, ${error}`
                });
            }
        });
    }
}
exports.profileService = new ProfileService();
