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
exports.bookingRepository = void 0;
const helpers_1 = require("../utils/helpers");
const database_1 = require("../utils/config/database");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../utils/config/schema");
const Hotel_pricing_availability_1 = require("./Hotel.pricing-availability");
const FlutterwavePayment_1 = require("./FlutterwavePayment");
const Hotels_basic_data_1 = require("./Hotels.basic-data");
class BookingRepository {
    createBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const { hotelId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const checkInDate = new Date(req.body.check_in_date);
            const checkOutDate = new Date(req.body.check_out_date);
            const roomTypes = req.body.roomTypes;
            const preferredCurrency = (((_b = req.user) === null || _b === void 0 ? void 0 : _b.preferred_currency) || 'RWF');
            const total_price = req.body.total_price;
            // Track state for rollback purposes
            let createdBooking = null;
            const createdBookingRoomTypes = [];
            const inventoryUpdates = [];
            try {
                let totalRooms = 0;
                let combinedCapacity = 0;
                let totalGuests = 0;
                // Step 1: Sequential availability check for all room types (read-only check first)
                console.log(`Processing multi-booking for user ${userId}: ${roomTypes.length} room types`);
                for (let i = 0; i < roomTypes.length; i++) {
                    const { roomtypeId, num_rooms, num_guests } = roomTypes[i];
                    console.log(`Checking availability for room type ${i + 1}/${roomTypes.length}: ${roomtypeId}`);
                    const availabilityCheck = yield Hotel_pricing_availability_1.roomOperationsRepository.isRoomAvailableForPeriod(roomtypeId, checkInDate, checkOutDate, num_guests, num_rooms);
                    if (!availabilityCheck.available) {
                        return {
                            data: null,
                            message: `Room type ${roomtypeId} is not available: ${availabilityCheck.reason}`,
                            status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                        };
                    }
                    totalRooms += num_rooms;
                    totalGuests += num_guests;
                    combinedCapacity += availabilityCheck.details.totalCapacity;
                }
                console.log(`All ${roomTypes.length} room types are available. Creating booking...`);
                // Step 2: Initialize payment first (before creating booking records)
                const paymentDetails = {
                    amount: total_price,
                    currency: preferredCurrency,
                    name: (_c = req.user) === null || _c === void 0 ? void 0 : _c.username,
                    email: (_d = req.user) === null || _d === void 0 ? void 0 : _d.email,
                    phone_number: ((_e = req.user) === null || _e === void 0 ? void 0 : _e.phone_number) || '',
                    customizationsTitle: `Hotel Booking - ${totalRooms} Room(s)`,
                    customizationsDescription: `Booking for ${totalGuests} guest(s) from ${checkInDate.toDateString()} to ${checkOutDate.toDateString()}`,
                };
                const hotelResponse = yield Hotels_basic_data_1.hotelRepository.getHotelById(hotelId);
                const paymentResponse = yield FlutterwavePayment_1.paymentRepository.Payment(paymentDetails, hotelResponse.data.subaccount_id);
                if (paymentResponse.status !== helpers_1.HttpStatusCodes.OK) {
                    return {
                        data: null,
                        message: `Payment initialization failed: ${paymentResponse.message}`,
                        status: paymentResponse.status
                    };
                }
                console.log('Payment initialized successfully. Creating booking record...');
                // Step 3: Create the main booking record with pending status
                const bookingData = {
                    user_id: userId,
                    hotel_id: hotelId,
                    check_in_date: checkInDate,
                    check_out_date: checkOutDate,
                    total_price,
                    currency: preferredCurrency,
                    payment_status: 'pending',
                    tx_ref: (_f = paymentResponse.data) === null || _f === void 0 ? void 0 : _f.tx_ref,
                };
                [createdBooking] = yield database_1.database
                    .insert(schema_1.bookings)
                    .values(bookingData)
                    .returning();
                console.log(`Booking created with ID: ${createdBooking.id}. Creating room type entries...`);
                // Step 4: Create booking room types entries one by one
                for (let i = 0; i < roomTypes.length; i++) {
                    const { roomtypeId, num_rooms, num_guests } = roomTypes[i];
                    try {
                        const [bookingRoomType] = yield database_1.database
                            .insert(schema_1.bookingRoomTypes)
                            .values({
                            booking_id: createdBooking.id,
                            roomTypeId: roomtypeId,
                            num_rooms,
                            num_guests,
                        })
                            .returning();
                        createdBookingRoomTypes.push(bookingRoomType);
                        console.log(`Created booking room type entry ${i + 1}/${roomTypes.length}`);
                    }
                    catch (error) {
                        console.error(`Failed to create booking room type entry for ${roomtypeId}:`, error);
                        // Rollback what we've created so far
                        yield this.rollbackBookingCreation(createdBooking.id, createdBookingRoomTypes, inventoryUpdates);
                        return {
                            data: null,
                            message: `Failed to create booking room type entry: ${error}`,
                            status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                        };
                    }
                }
                console.log('All booking room type entries created. Updating inventory...');
                // Step 5: Check and reserve inventory for each room type one by one
                for (let i = 0; i < roomTypes.length; i++) {
                    const { roomtypeId, num_rooms, num_guests } = roomTypes[i];
                    console.log(`Checking and reserving inventory for room type ${i + 1}/${roomTypes.length}: ${roomtypeId}`);
                    const reservationResult = yield this.checkAndReserveRoomInventory(roomtypeId, checkInDate, checkOutDate, num_guests, num_rooms);
                    if (!reservationResult.success) {
                        console.error(`Failed to reserve room type ${roomtypeId}: ${reservationResult.reason}`);
                        // Rollback everything created so far
                        yield this.rollbackBookingCreation(createdBooking.id, createdBookingRoomTypes, inventoryUpdates);
                        return {
                            data: null,
                            message: `Failed to reserve room type ${roomtypeId}: ${reservationResult.reason}`,
                            status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                        };
                    }
                    // Track successful inventory update for potential rollback
                    inventoryUpdates.push({ roomTypeId: roomtypeId, numRooms: num_rooms });
                    console.log(`Successfully reserved inventory for room type ${i + 1}/${roomTypes.length}: ${roomtypeId}`);
                }
                console.log('Multi-booking completed successfully!');
                // Step 6: Return success response
                return {
                    message: `Booking created successfully. Please complete payment in 30 minutes using checkout link to confirm your reservation.`,
                    data: {
                        checkout_url: (_g = paymentResponse.data) === null || _g === void 0 ? void 0 : _g.checkout_link,
                        booking: createdBooking,
                        booking_room_types: createdBookingRoomTypes,
                        summary: {
                            booking_id: createdBooking.id,
                            rooms_booked: totalRooms,
                            guests_accommodated: totalGuests,
                            total_capacity: combinedCapacity,
                            room_type_breakdown: roomTypes.map(rt => ({
                                roomtypeId: rt.roomtypeId,
                                num_rooms: rt.num_rooms,
                                num_guests: rt.num_guests
                            }))
                        },
                    },
                    status: helpers_1.HttpStatusCodes.CREATED,
                };
            }
            catch (error) {
                console.error('Error in createBooking:', error);
                // Rollback any partial state
                if (createdBooking) {
                    yield this.rollbackBookingCreation(createdBooking.id, createdBookingRoomTypes, inventoryUpdates);
                }
                return {
                    data: null,
                    message: `Booking creation failed: ${(error === null || error === void 0 ? void 0 : error.message) || error}`,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
    // Helper method to handle comprehensive rollback
    rollbackBookingCreation(bookingId, createdBookingRoomTypes, inventoryUpdates) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Rolling back booking creation for booking ID: ${bookingId}`);
            try {
                // Step 1: Restore inventory (reverse order of operations)
                for (const { roomTypeId, numRooms } of inventoryUpdates) {
                    try {
                        yield Hotel_pricing_availability_1.roomOperationsRepository.increaseRoomInventory(roomTypeId, numRooms);
                        console.log(`Restored inventory for room type: ${roomTypeId}`);
                    }
                    catch (error) {
                        console.error(`Failed to restore inventory for room type ${roomTypeId}:`, error);
                    }
                }
                // Step 2: Delete booking room types (if any were created)
                if (createdBookingRoomTypes.length > 0) {
                    try {
                        yield database_1.database
                            .delete(schema_1.bookingRoomTypes)
                            .where((0, drizzle_orm_1.eq)(schema_1.bookingRoomTypes.booking_id, bookingId));
                        console.log(`Deleted ${createdBookingRoomTypes.length} booking room type entries`);
                    }
                    catch (error) {
                        console.error('Failed to delete booking room types:', error);
                    }
                }
                // Step 3: Delete main booking record
                try {
                    yield database_1.database
                        .delete(schema_1.bookings)
                        .where((0, drizzle_orm_1.eq)(schema_1.bookings.id, bookingId));
                    console.log(`Deleted main booking record: ${bookingId}`);
                }
                catch (error) {
                    console.error('Failed to delete main booking:', error);
                }
            }
            catch (error) {
                console.error('Error during rollback:', error);
                // Log this for manual intervention
            }
        });
    }
    // Helper method to check and reserve room inventory with better error handling
    checkAndReserveRoomInventory(roomTypeId, checkInDate, checkOutDate, numGuests, numRooms) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const availabilityCheck = yield Hotel_pricing_availability_1.roomOperationsRepository.isRoomAvailableForPeriod(roomTypeId, checkInDate, checkOutDate, numGuests, numRooms);
                if (!availabilityCheck.available) {
                    return {
                        success: false,
                        reason: availabilityCheck.reason
                    };
                }
                // If available, attempt to reserve inventory
                const inventoryUpdated = yield Hotel_pricing_availability_1.roomOperationsRepository.decreaseRoomInventory(roomTypeId, numRooms);
                if (!inventoryUpdated) {
                    return {
                        success: false,
                        reason: "Failed to reserve inventory - may have been taken by another booking"
                    };
                }
                return {
                    success: true,
                    details: {
                        totalCapacity: availabilityCheck.details.totalCapacity,
                        maxOccupancy: availabilityCheck.details.maxOccupancy
                    }
                };
            }
            catch (error) {
                console.error('Error in checkAndReserveRoomInventory:', error);
                return {
                    success: false,
                    reason: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`
                };
            }
        });
    }
    // method to verify payment status for pending bookings
    verifyBookingPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { booking_id } = req.params;
            try {
                const [booking] = yield database_1.database
                    .select()
                    .from(schema_1.bookings)
                    .where((0, drizzle_orm_1.eq)(schema_1.bookings.id, booking_id));
                if (!booking) {
                    return {
                        data: null,
                        message: 'Booking not found',
                        status: helpers_1.HttpStatusCodes.NOT_FOUND,
                    };
                }
                if (!booking.tx_ref) {
                    return {
                        data: null,
                        message: 'No transaction reference found for this booking',
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                    };
                }
                const transactionReference = booking.tx_ref;
                // Verify payment with Flutterwave
                const verificationResponse = (yield FlutterwavePayment_1.paymentRepository.verifyPayment(transactionReference));
                if (verificationResponse.status === helpers_1.HttpStatusCodes.OK) {
                    // Only update if not already marked as completed
                    if (booking.payment_status !== 'completed') {
                        const [updatedBooking] = yield database_1.database
                            .update(schema_1.bookings)
                            .set({
                            payment_status: 'completed',
                            updated_at: new Date(),
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.bookings.id, booking_id))
                            .returning();
                        return {
                            message: `Payment verified and booking ${booking_id} confirmed`,
                            status: helpers_1.HttpStatusCodes.OK,
                            data: updatedBooking,
                        };
                    }
                    return {
                        message: 'Payment already verified for this booking',
                        status: helpers_1.HttpStatusCodes.OK,
                        data: booking,
                    };
                }
                return {
                    message: 'Payment verification failed',
                    status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error
                        ? error.message
                        : 'Payment verification failed',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
    // Read - Get All User Bookings (with room types)
    getUserBookings(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            this.processExpiredCheckouts();
            try {
                // Get bookings with their room types
                const userBookings = yield database_1.database
                    .select({
                    booking: schema_1.bookings,
                    roomTypes: schema_1.bookingRoomTypes,
                })
                    .from(schema_1.bookings)
                    .leftJoin(schema_1.bookingRoomTypes, (0, drizzle_orm_1.eq)(schema_1.bookings.id, schema_1.bookingRoomTypes.booking_id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.bookings.user_id, userId), (0, drizzle_orm_1.eq)(schema_1.bookings.cancelled, false)));
                // Group room types by booking
                const groupedBookings = userBookings.reduce((acc, item) => {
                    const bookingId = item.booking.id;
                    if (!acc[bookingId]) {
                        acc[bookingId] = Object.assign(Object.assign({}, item.booking), { room_types: [] });
                    }
                    if (item.roomTypes) {
                        acc[bookingId].room_types.push(item.roomTypes);
                    }
                    return acc;
                }, {});
                return {
                    data: Object.values(groupedBookings),
                    message: 'User bookings fetched successfully',
                    status: helpers_1.HttpStatusCodes.OK,
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
    // Read - Get Specific Booking (with room types)
    getSpecificBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingId = req.params.bookingId;
            // Free up rooms
            this.processExpiredCheckouts();
            try {
                const [booking] = yield database_1.database
                    .select()
                    .from(schema_1.bookings)
                    .where((0, drizzle_orm_1.eq)(schema_1.bookings.id, bookingId));
                if (!booking) {
                    return {
                        data: null,
                        message: 'Booking not found',
                        status: helpers_1.HttpStatusCodes.NOT_FOUND,
                    };
                }
                // Get associated room types
                const roomTypesData = yield database_1.database
                    .select()
                    .from(schema_1.bookingRoomTypes)
                    .where((0, drizzle_orm_1.eq)(schema_1.bookingRoomTypes.booking_id, bookingId));
                return {
                    data: Object.assign(Object.assign({}, booking), { room_types: roomTypesData }),
                    message: 'Booking fetched successfully',
                    status: helpers_1.HttpStatusCodes.OK,
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
    // Update - Update Booking
    updateBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingId = req.params.bookingId;
            const updateData = req.body;
            // AutoProcess expired checkouts
            this.processExpiredCheckouts();
            try {
                const [existingBooking] = yield database_1.database
                    .select()
                    .from(schema_1.bookings)
                    .where((0, drizzle_orm_1.eq)(schema_1.bookings.id, bookingId));
                if (!existingBooking) {
                    return {
                        data: null,
                        message: 'Booking not found',
                        status: helpers_1.HttpStatusCodes.NOT_FOUND,
                    };
                }
                const updatedData = Object.assign(Object.assign({}, updateData), { updated_at: new Date() });
                const [updatedBooking] = yield database_1.database
                    .update(schema_1.bookings)
                    .set(updatedData)
                    .where((0, drizzle_orm_1.eq)(schema_1.bookings.id, bookingId))
                    .returning();
                return {
                    data: updatedBooking,
                    message: 'Booking updated successfully',
                    status: helpers_1.HttpStatusCodes.OK,
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
    // Update - Cancel Booking (Fixed to handle normalized tables)
    cancelBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingId = req.params.bookingId;
            const { cancellation_reason } = req.body;
            // AutoProcess Expired checkouts
            this.processExpiredCheckouts();
            try {
                // Get existing booking
                const [existingBooking] = yield database_1.database
                    .select()
                    .from(schema_1.bookings)
                    .where((0, drizzle_orm_1.eq)(schema_1.bookings.id, bookingId));
                if (!existingBooking) {
                    return {
                        data: null,
                        message: 'Booking not found',
                        status: helpers_1.HttpStatusCodes.NOT_FOUND,
                    };
                }
                if (existingBooking.cancelled) {
                    return {
                        data: null,
                        message: 'Booking is already cancelled',
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                    };
                }
                // Get associated room types for inventory update
                const bookingRoomTypesData = yield database_1.database
                    .select()
                    .from(schema_1.bookingRoomTypes)
                    .where((0, drizzle_orm_1.eq)(schema_1.bookingRoomTypes.booking_id, bookingId));
                // Cancel booking
                const [cancelledBooking] = yield database_1.database
                    .update(schema_1.bookings)
                    .set({
                    cancelled: true,
                    cancellation_timestamp: new Date(),
                    cancellation_reason,
                    updated_at: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.bookings.id, bookingId))
                    .returning();
                // Update dynamic inventory - increase available rooms for each room type
                let totalRoomsFreed = 0;
                let totalGuestsAffected = 0;
                for (const roomType of bookingRoomTypesData) {
                    const inventoryUpdated = yield Hotel_pricing_availability_1.roomOperationsRepository.increaseRoomInventory(roomType.roomTypeId, roomType.num_rooms);
                    if (!inventoryUpdated) {
                        console.error(`Failed to update room inventory after cancellation for room type: ${roomType.roomTypeId}`);
                        // Log error but don't fail the cancellation
                    }
                    else {
                        totalRoomsFreed += roomType.num_rooms;
                        totalGuestsAffected += roomType.num_guests;
                    }
                }
                return {
                    data: Object.assign(Object.assign({}, cancelledBooking), { room_types: bookingRoomTypesData, summary: {
                            rooms_freed: totalRoomsFreed,
                            guests_affected: totalGuestsAffected,
                            booking_period: {
                                check_in: existingBooking.check_in_date,
                                check_out: existingBooking.check_out_date,
                            },
                        } }),
                    message: `Booking cancelled: ${totalRoomsFreed} room(s) now available`,
                    status: helpers_1.HttpStatusCodes.OK,
                };
            }
            catch (error) {
                return {
                    data: null,
                    message: error instanceof Error ? error.message : 'Cancellation failed',
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
    processExpiredCheckouts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                // Find all active bookings where checkout time has passed
                const expiredBookings = yield database_1.database
                    .select({
                    booking: schema_1.bookings,
                    roomTypes: schema_1.bookingRoomTypes,
                })
                    .from(schema_1.bookings)
                    .leftJoin(schema_1.bookingRoomTypes, (0, drizzle_orm_1.eq)(schema_1.bookings.id, schema_1.bookingRoomTypes.booking_id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.bookings.cancelled, false), (0, drizzle_orm_1.lte)(schema_1.bookings.check_out_date, now)));
                // Group by booking ID
                const groupedExpiredBookings = expiredBookings.reduce((acc, item) => {
                    const bookingId = item.booking.id;
                    if (!acc[bookingId]) {
                        acc[bookingId] = {
                            booking: item.booking,
                            roomTypes: [],
                        };
                    }
                    if (item.roomTypes) {
                        acc[bookingId].roomTypes.push(item.roomTypes);
                    }
                    return acc;
                }, {});
                let totalRoomsFreed = 0;
                // Process each expired booking
                for (const { booking, roomTypes } of Object.values(groupedExpiredBookings)) {
                    // Free up rooms for each room type in the booking
                    for (const roomType of roomTypes) {
                        yield database_1.database
                            .update(schema_1.room)
                            .set({
                            available_inventory: (0, drizzle_orm_1.sql) `${schema_1.room.available_inventory} + ${roomType.num_rooms}`,
                            updated_at: new Date(),
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.room.id, roomType.roomTypeId));
                        totalRoomsFreed += roomType.num_rooms;
                    }
                    // Mark booking as processed
                    yield database_1.database
                        .update(schema_1.bookings)
                        .set({
                        updated_at: new Date(),
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.bookings.id, booking.id));
                }
                return totalRoomsFreed;
            }
            catch (error) {
                console.error('Error processing expired checkouts:', error);
                return 0;
            }
        });
    }
    processExpiredPendingPayments() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
                // Find all bookings that are:
                // 1. Created more than 30 minutes ago
                // 2. Still have pending payment status
                // 3. Not already cancelled
                const expiredPendingBookings = yield database_1.database
                    .select({
                    booking: schema_1.bookings,
                    roomTypes: schema_1.bookingRoomTypes,
                })
                    .from(schema_1.bookings)
                    .leftJoin(schema_1.bookingRoomTypes, (0, drizzle_orm_1.eq)(schema_1.bookings.id, schema_1.bookingRoomTypes.booking_id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.bookings.payment_status, 'pending'), (0, drizzle_orm_1.eq)(schema_1.bookings.cancelled, false), (0, drizzle_orm_1.sql) `${schema_1.bookings.created_at} <= ${thirtyMinutesAgo.toISOString()}`));
                // Group by booking ID
                const groupedExpiredBookings = expiredPendingBookings.reduce((acc, item) => {
                    const bookingId = item.booking.id;
                    if (!acc[bookingId]) {
                        acc[bookingId] = {
                            booking: item.booking,
                            roomTypes: [],
                        };
                    }
                    if (item.roomTypes) {
                        acc[bookingId].roomTypes.push(item.roomTypes);
                    }
                    return acc;
                }, {});
                let totalBookingsProcessed = 0;
                let totalRoomsFreed = 0;
                // Process each expired booking
                for (const { booking, roomTypes } of Object.values(groupedExpiredBookings)) {
                    try {
                        // Mark booking as cancelled due to payment timeout
                        yield database_1.database
                            .update(schema_1.bookings)
                            .set({
                            cancelled: true,
                            payment_status: 'failed',
                            cancellation_timestamp: new Date(),
                            cancellation_reason: 'Payment timeout - booking expired after 30 minutes',
                            updated_at: new Date(),
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.bookings.id, booking.id));
                        // Free up the rooms by increasing available inventory for each room type
                        for (const roomType of roomTypes) {
                            const inventoryUpdated = yield Hotel_pricing_availability_1.roomOperationsRepository.increaseRoomInventory(roomType.roomTypeId, roomType.num_rooms);
                            if (inventoryUpdated) {
                                totalRoomsFreed += roomType.num_rooms;
                            }
                            else {
                                console.error(`Failed to update inventory for expired booking room type: ${roomType.roomTypeId}`);
                            }
                        }
                        totalBookingsProcessed++;
                        console.log(`Expired booking processed: ${booking.id} - ${roomTypes.reduce((sum, rt) => sum + rt.num_rooms, 0)} room(s) freed`);
                    }
                    catch (error) {
                        console.error(`Error processing expired booking ${booking.id}:`, error);
                    }
                }
                if (totalBookingsProcessed > 0) {
                    console.log(`Processed ${totalBookingsProcessed} expired bookings, freed up ${totalRoomsFreed} room(s)`);
                }
                return totalBookingsProcessed;
            }
            catch (error) {
                console.error('Error processing expired pending payments:', error);
                return 0;
            }
        });
    }
    getHotelBookings(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { hotel_id } = req.query;
                if (!hotel_id) {
                    return {
                        data: null,
                        message: 'Hotel ID is required',
                        status: helpers_1.HttpStatusCodes.BAD_REQUEST,
                    };
                }
                // Get all bookings for the hotel
                const hotelBookings = yield database_1.database
                    .select()
                    .from(schema_1.bookings)
                    .where((0, drizzle_orm_1.eq)(schema_1.bookings.hotel_id, hotel_id));
                return {
                    data: hotelBookings,
                    message: 'Hotel bookings retrieved successfully',
                    status: helpers_1.HttpStatusCodes.OK,
                };
            }
            catch (error) {
                console.error('Error fetching hotel bookings:', error);
                return {
                    data: null,
                    message: `Failed to retrieve hotel bookings: ${(error === null || error === void 0 ? void 0 : error.message) || error}`,
                    status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
}
exports.bookingRepository = new BookingRepository();
