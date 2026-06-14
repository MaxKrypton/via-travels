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
exports.HotelService = void 0;
const Hotels_basic_data_1 = require("../repository/Hotels.basic-data");
const helpers_1 = require("../utils/helpers");
class Hotels {
    getAllHotels(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotels_basic_data_1.hotelRepository.getAllHotels();
                return res.status(status).json({
                    message: message,
                    data: data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error
                });
            }
        });
    }
    getSpecificHotel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotels_basic_data_1.hotelRepository.getSpecificHotel(req);
                return res.status(status).json({
                    message: message,
                    data: data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error
                });
            }
        });
    }
    registerHotel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotels_basic_data_1.hotelRepository.createHotel(req);
                return res.status(status).json({
                    message: message,
                    data: data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error
                });
            }
        });
    }
    updateHotel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotels_basic_data_1.hotelRepository.updateHotel(req);
                return res.status(status).json({
                    message: message,
                    data: data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error
                });
            }
        });
    }
    deleteSpecificHotel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotels_basic_data_1.hotelRepository.deleteHotel(req);
                return res.status(status).json({
                    message: message,
                    data: data
                });
            }
            catch (error) {
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error
                });
            }
        });
    }
}
exports.HotelService = new Hotels();
