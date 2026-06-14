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
exports.HotelRoomService = void 0;
const Hotel_rooms_1 = require("../repository/Hotel.rooms");
const helpers_1 = require("../utils/helpers");
class HotelRooms {
    createRoomType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_rooms_1.roomRepository.RegisterRoomTypes(req);
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
    getRoomTypeByHotelId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_rooms_1.roomRepository.getRoomTypesByHotelId(req);
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
    getSpecificRoomType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_rooms_1.roomRepository.getSpecificRoomType(req);
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
    updateRoomTypeDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_rooms_1.roomRepository.updateRoomType(req);
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
    deleteRoomType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_rooms_1.roomRepository.deleteRoomType(req);
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
exports.HotelRoomService = new HotelRooms();
