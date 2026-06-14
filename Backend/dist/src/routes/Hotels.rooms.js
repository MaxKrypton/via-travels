"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelRoomsRoutes = void 0;
const express_1 = require("express");
const Hotel_room_1 = require("../services/Hotel.room");
const authMiddleware_1 = require("../middleware/authMiddleware");
const RolesAndPermissions_1 = require("../middleware/RolesAndPermissions");
exports.HotelRoomsRoutes = (0, express_1.Router)();
exports.HotelRoomsRoutes.get('/:hotelId', (req, res) => {
    return Hotel_room_1.HotelRoomService.getRoomTypeByHotelId(req, res);
});
exports.HotelRoomsRoutes.get('/:hotelId/:roomTypeId', (req, res) => {
    return Hotel_room_1.HotelRoomService.getSpecificRoomType(req, res);
});
exports.HotelRoomsRoutes.post('/register/:hotelId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerOrAdminPermitted, (req, res) => {
    return Hotel_room_1.HotelRoomService.createRoomType(req, res);
});
exports.HotelRoomsRoutes.patch('/update/:hotelId/:roomTypeId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerOrAdminPermitted, (req, res) => {
    return Hotel_room_1.HotelRoomService.updateRoomTypeDetails(req, res);
});
exports.HotelRoomsRoutes.delete('/delete/:hotelId/:roomTypeId', authMiddleware_1.authMiddleware, RolesAndPermissions_1.rolesAndPermissions.hotelManagerOrAdminPermitted, (req, res) => {
    return Hotel_room_1.HotelRoomService.deleteRoomType(req, res);
});
