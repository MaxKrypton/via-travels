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
const express_1 = require("express");
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const helpers_1 = require("../utils/helpers");
const router = (0, express_1.Router)();
// GET /api/hotels/:hotelId/rooms
router.get('/:hotelId/rooms', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId } = req.params;
        // Validate hotelId
        if (!hotelId) {
            return res.status(helpers_1.HttpStatusCodes.BAD_REQUEST).json({
                message: 'Hotel ID is required',
            });
        }
        // Get hotel information
        const [hotel] = yield database_1.database
            .select({
            id: schema_1.hotels.id,
            name: schema_1.hotels.name,
        })
            .from(schema_1.hotels)
            .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, hotelId))
            .limit(1);
        if (!hotel) {
            return res.status(helpers_1.HttpStatusCodes.NOT_FOUND).json({
                message: 'Hotel not found',
            });
        }
        // Get all rooms for this hotel with their pricing
        const roomsWithPricing = yield database_1.database
            .select({
            id: schema_1.room.id,
            type: schema_1.room.type,
            description: schema_1.room.description,
            max_occupancy: schema_1.room.max_occupancy,
            num_beds: schema_1.room.num_beds,
            room_size: schema_1.room.room_size,
            total_inventory: schema_1.room.total_inventory,
            available_inventory: schema_1.room.available_inventory,
            roomFee: schema_1.roomPricing.roomFee,
            serviceFee: schema_1.roomPricing.serviceFee,
        })
            .from(schema_1.room)
            .leftJoin(schema_1.roomPricing, (0, drizzle_orm_1.eq)(schema_1.room.id, schema_1.roomPricing.roomTypeId))
            .where((0, drizzle_orm_1.eq)(schema_1.room.hotel_id, hotelId));
        // Format the response
        const formattedRooms = roomsWithPricing.map((r) => ({
            id: r.id,
            type: r.type,
            description: r.description,
            max_occupancy: r.max_occupancy,
            num_beds: r.num_beds,
            room_size: r.room_size,
            total_inventory: r.total_inventory,
            available_inventory: r.available_inventory,
            roomFee: r.roomFee || '0',
            serviceFee: r.serviceFee || '0',
        }));
        return res.status(helpers_1.HttpStatusCodes.OK).json({
            hotelName: hotel.name,
            hotelId: hotel.id,
            rooms: formattedRooms,
        });
    }
    catch (error) {
        console.error('Error fetching hotel rooms:', error);
        return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to fetch hotel rooms',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}));
exports.default = router;
