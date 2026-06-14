"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelPriceModifiersRoutes = void 0;
const express_1 = require("express");
const Hotel_price_modifiers_1 = require("../services/Hotel.price-modifiers");
const authMiddleware_1 = require("../middleware/authMiddleware");
const RolesAndPermissions_1 = require("../middleware/RolesAndPermissions");
exports.HotelPriceModifiersRoutes = (0, express_1.Router)();
exports.HotelPriceModifiersRoutes.post('/create/:roomTypeId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerOrAdminPermitted, (req, res) => {
    return Hotel_price_modifiers_1.HotelPriceModifierService.createPriceModifier(req, res);
});
exports.HotelPriceModifiersRoutes.get('/:roomTypeId', (req, res) => {
    return Hotel_price_modifiers_1.HotelPriceModifierService.getPriceModifiersByRoomTypeId(req, res);
});
exports.HotelPriceModifiersRoutes.get('/hot-deals', (req, res) => {
    return Hotel_price_modifiers_1.HotelPriceModifierService.getHotDeals(req, res);
});
exports.HotelPriceModifiersRoutes.patch('/update/:roomTypeId/:discountId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerOrAdminPermitted, (req, res) => {
    return Hotel_price_modifiers_1.HotelPriceModifierService.updatePriceModifier(req, res);
});
exports.HotelPriceModifiersRoutes.delete('/delete/:roomTypeId/:discountId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerOrAdminPermitted, (req, res) => {
    return Hotel_price_modifiers_1.HotelPriceModifierService.deletePriceModifier(req, res);
});
