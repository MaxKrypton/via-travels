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
exports.roomRepository = void 0;
const helpers_1 = require("../utils/helpers");
const database_1 = require("../utils/config/database");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../utils/config/schema");
class Rooms {
    // Create - Register New Room Type
    RegisterRoomTypes(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotelId = req.params.hotelId;
            try {
                const roomData = {
                    hotel_id: hotelId,
                    type: req.body.type,
                    description: req.body.description,
                    max_occupancy: req.body.max_occupancy,
                    num_beds: req.body.num_beds,
                    room_size: req.body.room_size,
                    total_inventory: req.body.total_inventory,
                    available_inventory: req.body.available_inventory
                };
                const [createdRoom] = yield database_1.database
                    .insert(schema_1.room)
                    .values(roomData)
                    .returning();
                return {
                    data: createdRoom,
                    message: "Room type created successfully",
                    status: helpers_1.HttpStatusCodes.CREATED
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    // Read - Get All Room Types for a Hotel
    // Read - Get All Room Types for a Hotel WITH PRICING
    getRoomTypesByHotelId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotelId = req.params.hotelId;
            try {
                // Join room with roomPricing to get pricing information
                const hotelRoomTypes = yield database_1.database
                    .select({
                    // Room details
                    id: schema_1.room.id,
                    hotel_id: schema_1.room.hotel_id,
                    type: schema_1.room.type,
                    description: schema_1.room.description,
                    max_occupancy: schema_1.room.max_occupancy,
                    num_beds: schema_1.room.num_beds,
                    room_size: schema_1.room.room_size,
                    total_inventory: schema_1.room.total_inventory,
                    available_inventory: schema_1.room.available_inventory,
                    created_at: schema_1.room.created_at,
                    updated_at: schema_1.room.updated_at,
                    // Pricing details (will be null if no pricing set)
                    roomFee: schema_1.roomPricing.roomFee,
                    serviceFee: schema_1.roomPricing.serviceFee,
                    currency: schema_1.roomPricing.currency,
                    tax_percentage: schema_1.roomPricing.tax_percentage,
                    child_policy: schema_1.roomPricing.child_policy,
                })
                    .from(schema_1.room)
                    .leftJoin(schema_1.roomPricing, (0, drizzle_orm_1.eq)(schema_1.room.id, schema_1.roomPricing.roomTypeId))
                    .where((0, drizzle_orm_1.eq)(schema_1.room.hotel_id, hotelId));
                return {
                    data: hotelRoomTypes,
                    message: "Hotel Rooms fetched successfully",
                    status: helpers_1.HttpStatusCodes.OK
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    // Read - Get Hotel Room Types and available rooms (FIXED)
    getSpecificRoomType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { hotelId } = req.params;
            const { check_in_date, check_out_date } = req.query;
            try {
                let checkInDate;
                let checkOutDate;
                // If dates are provided, use them; otherwise use current date
                if (check_in_date && check_out_date) {
                    checkInDate = new Date(check_in_date);
                    checkOutDate = new Date(check_out_date);
                }
                else {
                    checkInDate = new Date();
                    checkOutDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
                }
                // Validate dates
                if (checkInDate >= checkOutDate) {
                    return {
                        data: null,
                        message: "Check-in date must be before check-out date",
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST
                    };
                }
                // Get all room types for the hotel
                const hotelRooms = yield database_1.database
                    .select({
                    room_id: schema_1.room.id,
                    room_type: schema_1.room.type,
                    total_inventory: schema_1.room.total_inventory,
                    max_occupancy: schema_1.room.max_occupancy,
                    num_beds: schema_1.room.num_beds,
                    room_size: schema_1.room.room_size,
                    description: schema_1.room.description
                })
                    .from(schema_1.room)
                    .where((0, drizzle_orm_1.eq)(schema_1.room.hotel_id, hotelId));
                if (hotelRooms.length === 0) {
                    return {
                        data: null,
                        message: "No rooms found for this hotel",
                        status: helpers_1.HttpStatusCodes.NOT_FOUND
                    };
                }
                // Calculate available rooms for each room type
                const roomAvailabilityData = [];
                for (const roomType of hotelRooms) {
                    // Count bookings that overlap with the requested period
                    // Now we need to join bookings with bookingRoomTypes to get the room type bookings
                    const overlappingBookings = yield database_1.database
                        .select({
                        total_rooms_booked: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.bookingRoomTypes.num_rooms}), 0)`
                    })
                        .from(schema_1.bookings)
                        .innerJoin(schema_1.bookingRoomTypes, (0, drizzle_orm_1.eq)(schema_1.bookings.id, schema_1.bookingRoomTypes.booking_id))
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.bookingRoomTypes.roomTypeId, roomType.room_id), (0, drizzle_orm_1.eq)(schema_1.bookings.cancelled, false), 
                    // Check for date overlap: booking starts before check_out and ends after check_in
                    (0, drizzle_orm_1.lte)(schema_1.bookings.check_in_date, checkOutDate), (0, drizzle_orm_1.gte)(schema_1.bookings.check_out_date, checkInDate)));
                    const bookedRoomsCount = Number(((_a = overlappingBookings[0]) === null || _a === void 0 ? void 0 : _a.total_rooms_booked) || 0);
                    const availableRooms = Math.max(0, roomType.total_inventory - bookedRoomsCount);
                    roomAvailabilityData.push({
                        room_id: roomType.room_id,
                        room_type: roomType.room_type,
                        total_inventory: roomType.total_inventory,
                        available_rooms: availableRooms,
                        booked_rooms: bookedRoomsCount,
                        max_occupancy: roomType.max_occupancy,
                        num_beds: roomType.num_beds,
                        room_size: roomType.room_size,
                        description: roomType.description
                    });
                }
                // Get hotel information
                const [hotelInfo] = yield database_1.database
                    .select({
                    hotel_name: schema_1.hotels.name
                })
                    .from(schema_1.hotels)
                    .where((0, drizzle_orm_1.eq)(schema_1.hotels.id, hotelId))
                    .limit(1);
                // Calculate summary statistics
                const totalRooms = roomAvailabilityData.reduce((sum, room) => sum + room.total_inventory, 0);
                const totalAvailableRooms = roomAvailabilityData.reduce((sum, room) => sum + room.available_rooms, 0);
                const totalBookedRooms = roomAvailabilityData.reduce((sum, room) => sum + room.booked_rooms, 0);
                const occupancyRate = totalRooms > 0 ? (totalBookedRooms / totalRooms) * 100 : 0;
                const summary = {
                    hotel_id: hotelId,
                    hotel_name: hotelInfo.hotel_name || 'Unknown Hotel',
                    total_room_types: roomAvailabilityData.length,
                    total_rooms: totalRooms,
                    available_rooms: totalAvailableRooms,
                    occupancy_rate: Math.round(occupancyRate * 100) / 100,
                    room_types: roomAvailabilityData
                };
                return {
                    data: {
                        summary,
                        check_in_date: checkInDate,
                        check_out_date: checkOutDate,
                        date_range_days: Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
                    },
                    message: "Room availability retrieved successfully",
                    status: helpers_1.HttpStatusCodes.OK
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    // Update - Update Room Type
    updateRoomType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotelId, roomTypeId } = req.params;
            const updateData = req.body;
            try {
                // Check if room type exists
                const [existingRoomType] = yield database_1.database
                    .select()
                    .from(schema_1.room)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.room.hotel_id, hotelId), (0, drizzle_orm_1.eq)(schema_1.room.id, roomTypeId)));
                if (!existingRoomType) {
                    return {
                        data: null,
                        message: "Rooms not found",
                        status: helpers_1.HttpStatusCodes.NOT_FOUND
                    };
                }
                const updatedData = Object.assign(Object.assign({}, updateData), { updated_at: new Date() });
                const [updatedRoomType] = yield database_1.database
                    .update(schema_1.room)
                    .set(updatedData)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.room.hotel_id, hotelId), (0, drizzle_orm_1.eq)(schema_1.room.id, roomTypeId)))
                    .returning();
                return {
                    data: updatedRoomType,
                    message: "Rooms updated successfully",
                    status: helpers_1.HttpStatusCodes.OK
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
    // Delete - Delete Room Type
    deleteRoomType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { hotelId, roomTypeId } = req.params;
            try {
                // Check if there are any active bookings for this room type before deleting
                const activeBookings = yield database_1.database
                    .select({
                    count: (0, drizzle_orm_1.sql) `count(*)`
                })
                    .from(schema_1.bookings)
                    .innerJoin(schema_1.bookingRoomTypes, (0, drizzle_orm_1.eq)(schema_1.bookings.id, schema_1.bookingRoomTypes.booking_id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.bookingRoomTypes.roomTypeId, roomTypeId), (0, drizzle_orm_1.eq)(schema_1.bookings.cancelled, false), (0, drizzle_orm_1.gte)(schema_1.bookings.check_out_date, new Date()) // Future or ongoing bookings
                ));
                const activeBookingCount = Number(((_a = activeBookings[0]) === null || _a === void 0 ? void 0 : _a.count) || 0);
                if (activeBookingCount > 0) {
                    return {
                        data: null,
                        message: `Cannot delete room type. There are ${activeBookingCount} active booking(s) for this room type.`,
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST
                    };
                }
                const [deletedRoomType] = yield database_1.database
                    .delete(schema_1.room)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.room.hotel_id, hotelId), (0, drizzle_orm_1.eq)(schema_1.room.id, roomTypeId)))
                    .returning();
                if (!deletedRoomType) {
                    return {
                        data: null,
                        message: "Room not found",
                        status: helpers_1.HttpStatusCodes.NOT_FOUND
                    };
                }
                return {
                    data: deletedRoomType,
                    message: "Rooms deleted successfully",
                    status: helpers_1.HttpStatusCodes.OK
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR
                };
            }
        });
    }
}
exports.roomRepository = new Rooms();
