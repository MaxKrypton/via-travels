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
exports.roomOperationsRepository = void 0;
const helpers_1 = require("../utils/helpers");
const database_1 = require("../utils/config/database");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../utils/config/schema");
class RoomOperations {
    // Room Pricing CRUD Operations
    createRoomTypePricing(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomTypeId = req.params.roomTypeId;
            try {
                const pricingData = {
                    roomTypeId: roomTypeId,
                    roomFee: req.body.roomFee,
                    serviceFee: req.body.serviceFee,
                    currency: req.body.currency || 'USD',
                    tax_percentage: req.body.tax_percentage,
                    child_policy: req.body.child_policy
                };
                const [createdPricing] = yield database_1.database
                    .insert(schema_1.roomPricing)
                    .values(pricingData)
                    .returning();
                return {
                    data: createdPricing,
                    message: "Room pricing created successfully",
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
    getRoomTypePricingByroomTypeId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomTypeId = req.params.roomTypeId;
            try {
                const [pricing] = yield database_1.database
                    .select()
                    .from(schema_1.roomPricing)
                    .where((0, drizzle_orm_1.eq)(schema_1.roomPricing.roomTypeId, roomTypeId));
                if (!pricing) {
                    return {
                        data: null,
                        message: "Room pricing not found",
                        status: helpers_1.HttpStatusCodes.NOT_FOUND
                    };
                }
                return {
                    data: pricing,
                    message: "Room pricing fetched successfully",
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
    updateRoomTypePricing(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roomTypeId, pricingId } = req.params;
            const updateData = req.body;
            try {
                const updatedData = Object.assign(Object.assign({}, updateData), { updated_at: new Date() });
                const [updatedPricing] = yield database_1.database
                    .update(schema_1.roomPricing)
                    .set(updatedData)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.roomPricing.roomTypeId, roomTypeId), (0, drizzle_orm_1.eq)(schema_1.roomPricing.id, pricingId)))
                    .returning();
                if (!updatedPricing) {
                    return {
                        data: null,
                        message: "Room pricing not found",
                        status: helpers_1.HttpStatusCodes.NOT_FOUND
                    };
                }
                return {
                    data: updatedPricing,
                    message: "Room pricing updated successfully",
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
    deleteRoomTypePricing(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roomTypeId, pricingId } = req.params;
            try {
                const [deletedPricing] = yield database_1.database
                    .delete(schema_1.roomPricing)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.roomPricing.roomTypeId, roomTypeId), (0, drizzle_orm_1.eq)(schema_1.roomPricing.id, pricingId)))
                    .returning();
                if (!deletedPricing) {
                    return {
                        data: null,
                        message: "Room pricing not found",
                        status: helpers_1.HttpStatusCodes.NOT_FOUND
                    };
                }
                return {
                    data: deletedPricing,
                    message: "Room pricing deleted successfully",
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
    // Room Availability - Simplified to inventory-based system
    getRoomTypeAvailability(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roomTypeId } = req.params;
            // const { startDate, endDate, numGuests } = req.body;
            const startDate = req.body.checkInDate;
            const endDate = req.body.checkOutDate;
            const numGuests = req.body.num_guests;
            const numRooms = req.body.num_rooms;
            try {
                // Use the same logic as isRoomAvailableForPeriod for consistency
                const checkStartDate = startDate ? new Date(startDate) : new Date();
                const checkEndDate = endDate ? new Date(endDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
                const requestedQuantity = numGuests ? parseInt(numGuests) : 1;
                const availabilityResult = yield this.isRoomAvailableForPeriod(roomTypeId, checkStartDate, checkEndDate, requestedQuantity, numRooms);
                return {
                    data: {
                        roomTypeId,
                        period: {
                            startDate: checkStartDate,
                            endDate: checkEndDate,
                            requestedQuantity
                        },
                        availability: availabilityResult
                    },
                    message: "Room availability checked successfully",
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
    isRoomAvailableForPeriod(roomTypeId, startDate, endDate, numGuests, numRooms) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Input validation
                if (!roomTypeId || !startDate || !endDate || numGuests <= 0 || numRooms <= 0) {
                    return {
                        available: false,
                        reason: "Invalid input parameters",
                        details: {
                            roomExists: false,
                            totalInventory: 0,
                            availableInventory: 0,
                            numGuests,
                            numRooms,
                            maxOccupancy: 0,
                            totalCapacity: 0,
                            hasInventory: false,
                            validOccupancy: false,
                        }
                    };
                }
                if (startDate >= endDate) {
                    return {
                        available: false,
                        reason: "Start date must be before end date",
                        details: {
                            roomExists: false,
                            totalInventory: 0,
                            availableInventory: 0,
                            numGuests,
                            numRooms,
                            maxOccupancy: 0,
                            totalCapacity: 0,
                            hasInventory: false,
                            validOccupancy: false,
                        }
                    };
                }
                // Get room type information with dynamic inventory
                const [roomInfo] = yield database_1.database
                    .select({
                    roomTypeId: schema_1.room.id,
                    room_type: schema_1.room.type,
                    total_inventory: schema_1.room.total_inventory,
                    available_inventory: schema_1.room.available_inventory, // Dynamic inventory
                    max_occupancy: schema_1.room.max_occupancy,
                    hotel_id: schema_1.room.hotel_id
                })
                    .from(schema_1.room)
                    .where((0, drizzle_orm_1.eq)(schema_1.room.id, roomTypeId))
                    .limit(1);
                if (!roomInfo) {
                    return {
                        available: false,
                        reason: "Room type not found",
                        details: {
                            roomExists: false,
                            totalInventory: 0,
                            availableInventory: 0,
                            numGuests,
                            numRooms,
                            maxOccupancy: 0,
                            totalCapacity: 0,
                            hasInventory: false,
                            validOccupancy: false,
                        }
                    };
                }
                // Validate occupancy: total_guests ≤ (max_occupancy × num_rooms)
                const totalCapacity = roomInfo.max_occupancy * numRooms;
                const validOccupancy = numGuests <= totalCapacity;
                if (!validOccupancy) {
                    return {
                        available: false,
                        reason: `Too many guests. ${numRooms} room(s) of '${roomInfo.room_type}' can accommodate maximum ${totalCapacity} guests (${roomInfo.max_occupancy} per room), but you requested ${numGuests} guests.`,
                        details: {
                            roomExists: true,
                            totalInventory: roomInfo.total_inventory,
                            availableInventory: roomInfo.available_inventory,
                            numGuests,
                            numRooms,
                            maxOccupancy: roomInfo.max_occupancy,
                            totalCapacity,
                            hasInventory: false,
                            validOccupancy: false,
                        },
                        roomInfo: {
                            roomTypeId: roomInfo.roomTypeId,
                            room_type: roomInfo.room_type,
                            hotel_id: roomInfo.hotel_id,
                            max_occupancy: roomInfo.max_occupancy,
                            total_inventory: roomInfo.total_inventory,
                            available_inventory: roomInfo.available_inventory
                        }
                    };
                }
                // Check dynamic inventory: available_inventory ≥ num_rooms
                const hasInventory = roomInfo.available_inventory >= numRooms;
                if (!hasInventory) {
                    return {
                        available: false,
                        reason: `Not enough rooms available. You requested ${numRooms} room(s), but only ${roomInfo.available_inventory} are available. Total inventory: ${roomInfo.total_inventory}`,
                        details: {
                            roomExists: true,
                            totalInventory: roomInfo.total_inventory,
                            availableInventory: roomInfo.available_inventory,
                            numGuests,
                            numRooms,
                            maxOccupancy: roomInfo.max_occupancy,
                            totalCapacity,
                            hasInventory: false,
                            validOccupancy: true,
                        },
                        roomInfo: {
                            roomTypeId: roomInfo.roomTypeId,
                            room_type: roomInfo.room_type,
                            hotel_id: roomInfo.hotel_id,
                            max_occupancy: roomInfo.max_occupancy,
                            total_inventory: roomInfo.total_inventory,
                            available_inventory: roomInfo.available_inventory
                        }
                    };
                }
                // Success - rooms are available
                return {
                    available: true,
                    reason: `${numRooms} room(s) available for ${numGuests} guests`,
                    details: {
                        roomExists: true,
                        totalInventory: roomInfo.total_inventory,
                        availableInventory: roomInfo.available_inventory,
                        numGuests,
                        numRooms,
                        maxOccupancy: roomInfo.max_occupancy,
                        totalCapacity,
                        hasInventory: true,
                        validOccupancy: true,
                    },
                    roomInfo: {
                        roomTypeId: roomInfo.roomTypeId,
                        room_type: roomInfo.room_type,
                        hotel_id: roomInfo.hotel_id,
                        max_occupancy: roomInfo.max_occupancy,
                        total_inventory: roomInfo.total_inventory,
                        available_inventory: roomInfo.available_inventory
                    }
                };
            }
            catch (error) {
                console.error('Error checking room availability:', error);
                return {
                    available: false,
                    reason: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    details: {
                        roomExists: false,
                        totalInventory: 0,
                        availableInventory: 0,
                        numGuests,
                        numRooms,
                        maxOccupancy: 0,
                        totalCapacity: 0,
                        hasInventory: false,
                        validOccupancy: false,
                    }
                };
            }
        });
    }
    decreaseRoomInventory(roomTypeId, numRooms) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield database_1.database
                    .update(schema_1.room)
                    .set({
                    available_inventory: (0, drizzle_orm_1.sql) `${schema_1.room.available_inventory} - ${numRooms}`,
                    updated_at: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.room.id, roomTypeId))
                    .returning();
                return result.length > 0;
            }
            catch (error) {
                console.error('Error decreasing room inventory:', error);
                return false;
            }
        });
    }
    increaseRoomInventory(roomTypeId, numRooms) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield database_1.database
                    .update(schema_1.room)
                    .set({
                    available_inventory: (0, drizzle_orm_1.sql) `${schema_1.room.available_inventory} + ${numRooms}`,
                    updated_at: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.room.id, roomTypeId))
                    .returning();
                return result.length > 0;
            }
            catch (error) {
                console.error('Error increasing room inventory:', error);
                return false;
            }
        });
    }
}
exports.roomOperationsRepository = new RoomOperations();
