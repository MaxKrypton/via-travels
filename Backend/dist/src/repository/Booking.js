"use strict";
// Backend/src/repository/Booking.ts
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
exports.BookingRepository = void 0;
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
class BookingRepository {
    // Get all bookings for a user with optional status filter
    getUserBookings(userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                let query = database_1.database
                    .select({
                    id: schema_1.bookings.id,
                    user_id: schema_1.bookings.user_id,
                    hotel_id: schema_1.bookings.hotel_id,
                    check_in_date: schema_1.bookings.check_in_date,
                    check_out_date: schema_1.bookings.check_out_date,
                    total_price: schema_1.bookings.total_price,
                    currency: schema_1.bookings.currency,
                    payment_status: schema_1.bookings.payment_status,
                    tx_ref: schema_1.bookings.tx_ref,
                    cancelled: schema_1.bookings.cancelled,
                    created_at: schema_1.bookings.created_at,
                    hotel_name: schema_1.hotels.name,
                    hotel_address: schema_1.hotels.street_address,
                    hotel_city: schema_1.hotels.city,
                    hotel_country: schema_1.hotels.country,
                })
                    .from(schema_1.bookings)
                    .leftJoin(schema_1.hotels, (0, drizzle_orm_1.eq)(schema_1.bookings.hotel_id, schema_1.hotels.id))
                    .where((0, drizzle_orm_1.eq)(schema_1.bookings.user_id, userId))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.bookings.created_at));
                const results = yield query;
                // Filter by status if provided
                let filteredResults = results;
                if (status === 'upcoming') {
                    filteredResults = results.filter(b => new Date(b.check_in_date) > now && !b.cancelled);
                }
                else if (status === 'completed') {
                    filteredResults = results.filter(b => new Date(b.check_out_date) < now && !b.cancelled);
                }
                else if (status === 'cancelled') {
                    filteredResults = results.filter(b => b.cancelled);
                }
                // Get room details for each booking
                const bookingsWithRooms = yield Promise.all(filteredResults.map((booking) => __awaiter(this, void 0, void 0, function* () {
                    const rooms = yield this.getBookingRooms(booking.id);
                    return Object.assign(Object.assign({}, booking), { rooms });
                })));
                return bookingsWithRooms;
            }
            catch (error) {
                console.error('Error fetching user bookings:', error);
                throw error;
            }
        });
    }
    // Get upcoming bookings (check-in date in the future)
    getUpcomingBookings(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                const results = yield database_1.database
                    .select({
                    id: schema_1.bookings.id,
                    user_id: schema_1.bookings.user_id,
                    hotel_id: schema_1.bookings.hotel_id,
                    check_in_date: schema_1.bookings.check_in_date,
                    check_out_date: schema_1.bookings.check_out_date,
                    total_price: schema_1.bookings.total_price,
                    currency: schema_1.bookings.currency,
                    payment_status: schema_1.bookings.payment_status,
                    tx_ref: schema_1.bookings.tx_ref,
                    cancelled: schema_1.bookings.cancelled,
                    created_at: schema_1.bookings.created_at,
                    hotel_name: schema_1.hotels.name,
                    hotel_address: schema_1.hotels.street_address,
                    hotel_city: schema_1.hotels.city,
                    hotel_country: schema_1.hotels.country,
                })
                    .from(schema_1.bookings)
                    .leftJoin(schema_1.hotels, (0, drizzle_orm_1.eq)(schema_1.bookings.hotel_id, schema_1.hotels.id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.bookings.user_id, userId), (0, drizzle_orm_1.gte)(schema_1.bookings.check_in_date, now), (0, drizzle_orm_1.eq)(schema_1.bookings.cancelled, false)))
                    .orderBy(schema_1.bookings.check_in_date);
                // Get room details for each booking
                const bookingsWithRooms = yield Promise.all(results.map((booking) => __awaiter(this, void 0, void 0, function* () {
                    const rooms = yield this.getBookingRooms(booking.id);
                    return Object.assign(Object.assign({}, booking), { rooms });
                })));
                return bookingsWithRooms;
            }
            catch (error) {
                console.error('Error fetching upcoming bookings:', error);
                throw error;
            }
        });
    }
    // Get completed bookings (check-out date in the past)
    getCompletedBookings(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                const results = yield database_1.database
                    .select({
                    id: schema_1.bookings.id,
                    user_id: schema_1.bookings.user_id,
                    hotel_id: schema_1.bookings.hotel_id,
                    check_in_date: schema_1.bookings.check_in_date,
                    check_out_date: schema_1.bookings.check_out_date,
                    total_price: schema_1.bookings.total_price,
                    currency: schema_1.bookings.currency,
                    payment_status: schema_1.bookings.payment_status,
                    tx_ref: schema_1.bookings.tx_ref,
                    cancelled: schema_1.bookings.cancelled,
                    created_at: schema_1.bookings.created_at,
                    hotel_name: schema_1.hotels.name,
                    hotel_address: schema_1.hotels.street_address,
                    hotel_city: schema_1.hotels.city,
                    hotel_country: schema_1.hotels.country,
                })
                    .from(schema_1.bookings)
                    .leftJoin(schema_1.hotels, (0, drizzle_orm_1.eq)(schema_1.bookings.hotel_id, schema_1.hotels.id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.bookings.user_id, userId), (0, drizzle_orm_1.lt)(schema_1.bookings.check_out_date, now), (0, drizzle_orm_1.eq)(schema_1.bookings.cancelled, false)))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.bookings.check_out_date));
                // Get room details for each booking
                const bookingsWithRooms = yield Promise.all(results.map((booking) => __awaiter(this, void 0, void 0, function* () {
                    const rooms = yield this.getBookingRooms(booking.id);
                    return Object.assign(Object.assign({}, booking), { rooms });
                })));
                return bookingsWithRooms;
            }
            catch (error) {
                console.error('Error fetching completed bookings:', error);
                throw error;
            }
        });
    }
    // Get booking by ID
    getBookingById(bookingId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield database_1.database
                    .select({
                    id: schema_1.bookings.id,
                    user_id: schema_1.bookings.user_id,
                    hotel_id: schema_1.bookings.hotel_id,
                    check_in_date: schema_1.bookings.check_in_date,
                    check_out_date: schema_1.bookings.check_out_date,
                    total_price: schema_1.bookings.total_price,
                    currency: schema_1.bookings.currency,
                    payment_status: schema_1.bookings.payment_status,
                    tx_ref: schema_1.bookings.tx_ref,
                    cancelled: schema_1.bookings.cancelled,
                    created_at: schema_1.bookings.created_at,
                    hotel_name: schema_1.hotels.name,
                    hotel_address: schema_1.hotels.street_address,
                    hotel_city: schema_1.hotels.city,
                    hotel_country: schema_1.hotels.country,
                })
                    .from(schema_1.bookings)
                    .leftJoin(schema_1.hotels, (0, drizzle_orm_1.eq)(schema_1.bookings.hotel_id, schema_1.hotels.id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.bookings.id, bookingId), (0, drizzle_orm_1.eq)(schema_1.bookings.user_id, userId)))
                    .limit(1);
                if (result.length === 0) {
                    return null;
                }
                const rooms = yield this.getBookingRooms(bookingId);
                return Object.assign(Object.assign({}, result[0]), { rooms });
            }
            catch (error) {
                console.error('Error fetching booking by ID:', error);
                throw error;
            }
        });
    }
    // Get rooms for a booking
    getBookingRooms(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rooms = yield database_1.database
                    .select({
                    room_type: schema_1.room.type,
                    num_rooms: schema_1.bookingRoomTypes.num_rooms,
                    num_guests: schema_1.bookingRoomTypes.num_guests,
                })
                    .from(schema_1.bookingRoomTypes)
                    .leftJoin(schema_1.room, (0, drizzle_orm_1.eq)(schema_1.bookingRoomTypes.roomTypeId, schema_1.room.id))
                    .where((0, drizzle_orm_1.eq)(schema_1.bookingRoomTypes.booking_id, bookingId));
                return rooms;
            }
            catch (error) {
                console.error('Error fetching booking rooms:', error);
                return [];
            }
        });
    }
    // Generate invoice for a booking
    generateInvoice(bookingId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield this.getBookingById(bookingId, userId);
                if (!booking) {
                    return null;
                }
                // Calculate number of nights
                const checkIn = new Date(booking.check_in_date);
                const checkOut = new Date(booking.check_out_date);
                const numNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                // Calculate tax (assuming 10%)
                const subtotal = parseFloat(booking.total_price);
                const tax = subtotal * 0.10;
                const total = subtotal + tax;
                // Generate invoice number
                const invoiceNumber = `INV-${booking.id.substring(0, 8).toUpperCase()}-${new Date().getFullYear()}`;
                // Calculate price per room type
                const roomsWithPrices = booking.rooms.map(room => {
                    const pricePerNight = subtotal / (numNights * room.num_rooms);
                    const subtotal_room = pricePerNight * numNights * room.num_rooms;
                    return Object.assign(Object.assign({}, room), { price_per_night: pricePerNight.toFixed(2), subtotal: subtotal_room.toFixed(2) });
                });
                const invoice = {
                    invoice_number: invoiceNumber,
                    booking_id: booking.id,
                    user_id: booking.user_id,
                    issue_date: new Date().toISOString(),
                    // Hotel details
                    hotel_name: booking.hotel_name,
                    hotel_address: booking.hotel_address,
                    hotel_city: booking.hotel_city,
                    hotel_country: booking.hotel_country,
                    hotel_contact: null, // Can be added if available
                    // Booking details
                    check_in_date: checkIn.toISOString(),
                    check_out_date: checkOut.toISOString(),
                    num_nights: numNights,
                    // Rooms
                    rooms: roomsWithPrices,
                    // Payment
                    subtotal: subtotal.toFixed(2),
                    tax: tax.toFixed(2),
                    total: total.toFixed(2),
                    currency: booking.currency,
                    payment_status: booking.payment_status,
                    payment_date: booking.payment_status === 'completed' ? booking.created_at.toISOString() : null,
                    tx_ref: booking.tx_ref
                };
                return invoice;
            }
            catch (error) {
                console.error('Error generating invoice:', error);
                throw error;
            }
        });
    }
}
exports.BookingRepository = BookingRepository;
