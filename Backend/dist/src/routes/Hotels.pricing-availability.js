"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelPricingAvailabilityRoutes = void 0;
const express_1 = require("express");
const Hotel_pricing_availability_1 = require("../services/Hotel.pricing-availability");
const authMiddleware_1 = require("../middleware/authMiddleware");
const RolesAndPermissions_1 = require("../middleware/RolesAndPermissions");
exports.HotelPricingAvailabilityRoutes = (0, express_1.Router)();
// Room Pricing Operations
exports.HotelPricingAvailabilityRoutes.get('/roomPricing/:roomTypeId', (req, res) => {
    return Hotel_pricing_availability_1.RoomOperationService.getRoomPricingByRoomId(req, res);
});
exports.HotelPricingAvailabilityRoutes.post('/roomPricing/:roomTypeId', authMiddleware_1.authMiddleware, (req, res) => {
    return Hotel_pricing_availability_1.RoomOperationService.createRoomPricing(req, res);
});
exports.HotelPricingAvailabilityRoutes.patch('/roomPricing/:roomTypeId/:pricingId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerOrAdminPermitted, (req, res) => {
    return Hotel_pricing_availability_1.RoomOperationService.updateRoomPricing(req, res);
});
exports.HotelPricingAvailabilityRoutes.delete('/roomPricing/:roomTypeId/:pricingId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerOrAdminPermitted, (req, res) => {
    return Hotel_pricing_availability_1.RoomOperationService.deleteRoomPricing(req, res);
});
// Room Availability
exports.HotelPricingAvailabilityRoutes.post('/roomAvailability/:roomTypeId', (req, res) => {
    return Hotel_pricing_availability_1.RoomOperationService.getRoomAvailability(req, res);
});
