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
exports.HotelPriceModifierService = void 0;
const Hotel_price_modifiers_1 = require("../repository/Hotel.price-modifiers");
const helpers_1 = require("../utils/helpers");
class HotelPriceModifiers {
    createPriceModifier(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_price_modifiers_1.priceModifierOperation.createPriceModifier(req);
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
    getPriceModifiersByRoomTypeId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_price_modifiers_1.priceModifierOperation.getPriceModifiersByroomTypeId(req);
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
    getHotDeals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_price_modifiers_1.priceModifierOperation.getHotDeals(req);
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
    updatePriceModifier(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_price_modifiers_1.priceModifierOperation.updatePriceModifier(req);
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
    deletePriceModifier(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, message, status } = yield Hotel_price_modifiers_1.priceModifierOperation.deletePriceModifier(req);
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
exports.HotelPriceModifierService = new HotelPriceModifiers();
