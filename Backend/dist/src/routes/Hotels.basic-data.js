"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelBasicDataRoutes = void 0;
const express_1 = require("express");
const Hotels_basic_data_1 = require("../services/Hotels.basic-data");
const authMiddleware_1 = require("../middleware/authMiddleware");
const RolesAndPermissions_1 = require("../middleware/RolesAndPermissions");
exports.HotelBasicDataRoutes = (0, express_1.Router)();
// Get all Hotel Profiles
exports.HotelBasicDataRoutes.get('/all-hotels', (req, res) => {
    return Hotels_basic_data_1.HotelService.getAllHotels(req, res);
});
// Get Specific Hotel Profile
exports.HotelBasicDataRoutes.get('/profile/:hotelId', (req, res) => {
    return Hotels_basic_data_1.HotelService.getSpecificHotel(req, res);
});
// Register Hotel Profile
exports.HotelBasicDataRoutes.post('/register', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.viaAdminOnly, (req, res) => {
    return Hotels_basic_data_1.HotelService.registerHotel(req, res);
});
// Update Hotel Profile
exports.HotelBasicDataRoutes.patch('/update/:hotelId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerOrAdminPermitted, (req, res) => {
    return Hotels_basic_data_1.HotelService.updateHotel(req, res);
});
// Delete Hotel Profile
exports.HotelBasicDataRoutes.delete('/delete/:hotelId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerOrAdminPermitted, (req, res) => {
    return Hotels_basic_data_1.HotelService.deleteSpecificHotel(req, res);
});
