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
exports.RoomOperationService = void 0;
const Hotel_pricing_availability_1 = require("../repository/Hotel.pricing-availability");
const helpers_1 = require("../utils/helpers");
class RoomOperations {
    createRoomPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_pricing_availability_1.roomOperationsRepository.createRoomTypePricing(req);
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
    getRoomPricingByRoomId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_pricing_availability_1.roomOperationsRepository.getRoomTypePricingByroomTypeId(req);
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
    updateRoomPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_pricing_availability_1.roomOperationsRepository.updateRoomTypePricing(req);
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
    deleteRoomPricing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_pricing_availability_1.roomOperationsRepository.deleteRoomTypePricing(req);
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
    getRoomAvailability(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_pricing_availability_1.roomOperationsRepository.getRoomTypeAvailability(req);
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
exports.RoomOperationService = new RoomOperations();
