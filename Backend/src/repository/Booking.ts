// Backend/src/repository/Booking.ts

import { database } from '../utils/config/database';
import { bookings, hotels, bookingRoomTypes, room } from '../utils/config/schema';
import { eq, and, gte, lt, desc } from 'drizzle-orm';

export interface BookingDetails {
  id: string;
  user_id: string;
  hotel_id: string;
  check_in_date: Date;
  check_out_date: Date;
  total_price: string;
  currency: string;
  payment_status: string;
  tx_ref: string | null;
  cancelled: boolean;
  created_at: Date;
  hotel_name: string;
  hotel_address: string;
  hotel_city: string;
  hotel_country: string;
  rooms: Array<{
    room_type: string;
    num_rooms: number;
    num_guests: number;
  }>;
}

export interface Invoice {
  invoice_number: string;
  booking_id: string;
  user_id: string;
  issue_date: string;

  // Hotel details
  hotel_name: string;
  hotel_address: string;
  hotel_city: string;
  hotel_country: string;
  hotel_contact: string | null;

  // Booking details
  check_in_date: string;
  check_out_date: string;
  num_nights: number;

  // Rooms
  rooms: Array<{
    room_type: string;
    num_rooms: number;
    num_guests: number;
    price_per_night: string;
    subtotal: string;
  }>;

  // Payment
  subtotal: string;
  tax: string;
  total: string;
  currency: string;
  payment_status: string;
  payment_date: string | null;
  tx_ref: string | null;
}

export class BookingRepository {

  // Get all bookings for a user with optional status filter
  async getUserBookings(userId: string, status?: string): Promise<BookingDetails[]> {
    try {
      const now = new Date();

      let query = database
        .select({
          id: bookings.id,
          user_id: bookings.user_id,
          hotel_id: bookings.hotel_id,
          check_in_date: bookings.check_in_date,
          check_out_date: bookings.check_out_date,
          total_price: bookings.total_price,
          currency: bookings.currency,
          payment_status: bookings.payment_status,
          tx_ref: bookings.tx_ref,
          cancelled: bookings.cancelled,
          created_at: bookings.created_at,
          hotel_name: hotels.name,
          hotel_address: hotels.street_address,
          hotel_city: hotels.city,
          hotel_country: hotels.country,
        })
        .from(bookings)
        .leftJoin(hotels, eq(bookings.hotel_id, hotels.id))
        .where(eq(bookings.user_id, userId))
        .orderBy(desc(bookings.created_at));

      const results = await query;

      // Filter by status if provided
      let filteredResults = results;
      if (status === 'upcoming') {
        filteredResults = results.filter(b => new Date(b.check_in_date) > now && !b.cancelled);
      } else if (status === 'completed') {
        filteredResults = results.filter(b => new Date(b.check_out_date) < now && !b.cancelled);
      } else if (status === 'cancelled') {
        filteredResults = results.filter(b => b.cancelled);
      }

      // Get room details for each booking
      const bookingsWithRooms = await Promise.all(
        filteredResults.map(async (booking) => {
          const rooms = await this.getBookingRooms(booking.id);
          return {
            ...booking,
            rooms
          };
        })
      );

      return bookingsWithRooms as BookingDetails[];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  }

  // Get upcoming bookings (check-in date in the future)
  async getUpcomingBookings(userId: string): Promise<BookingDetails[]> {
    try {
      const now = new Date();

      const results = await database
        .select({
          id: bookings.id,
          user_id: bookings.user_id,
          hotel_id: bookings.hotel_id,
          check_in_date: bookings.check_in_date,
          check_out_date: bookings.check_out_date,
          total_price: bookings.total_price,
          currency: bookings.currency,
          payment_status: bookings.payment_status,
          tx_ref: bookings.tx_ref,
          cancelled: bookings.cancelled,
          created_at: bookings.created_at,
          hotel_name: hotels.name,
          hotel_address: hotels.street_address,
          hotel_city: hotels.city,
          hotel_country: hotels.country,
        })
        .from(bookings)
        .leftJoin(hotels, eq(bookings.hotel_id, hotels.id))
        .where(
          and(
            eq(bookings.user_id, userId),
            gte(bookings.check_in_date, now),
            eq(bookings.cancelled, false)
          )
        )
        .orderBy(bookings.check_in_date);

      // Get room details for each booking
      const bookingsWithRooms = await Promise.all(
        results.map(async (booking) => {
          const rooms = await this.getBookingRooms(booking.id);
          return {
            ...booking,
            rooms
          };
        })
      );

      return bookingsWithRooms as BookingDetails[];
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      throw error;
    }
  }

  // Get completed bookings (check-out date in the past)
  async getCompletedBookings(userId: string): Promise<BookingDetails[]> {
    try {
      const now = new Date();

      const results = await database
        .select({
          id: bookings.id,
          user_id: bookings.user_id,
          hotel_id: bookings.hotel_id,
          check_in_date: bookings.check_in_date,
          check_out_date: bookings.check_out_date,
          total_price: bookings.total_price,
          currency: bookings.currency,
          payment_status: bookings.payment_status,
          tx_ref: bookings.tx_ref,
          cancelled: bookings.cancelled,
          created_at: bookings.created_at,
          hotel_name: hotels.name,
          hotel_address: hotels.street_address,
          hotel_city: hotels.city,
          hotel_country: hotels.country,
        })
        .from(bookings)
        .leftJoin(hotels, eq(bookings.hotel_id, hotels.id))
        .where(
          and(
            eq(bookings.user_id, userId),
            lt(bookings.check_out_date, now),
            eq(bookings.cancelled, false)
          )
        )
        .orderBy(desc(bookings.check_out_date));

      // Get room details for each booking
      const bookingsWithRooms = await Promise.all(
        results.map(async (booking) => {
          const rooms = await this.getBookingRooms(booking.id);
          return {
            ...booking,
            rooms
          };
        })
      );

      return bookingsWithRooms as BookingDetails[];
    } catch (error) {
      console.error('Error fetching completed bookings:', error);
      throw error;
    }
  }

  // Get booking by ID
  async getBookingById(bookingId: string, userId: string): Promise<BookingDetails | null> {
    try {
      const result = await database
        .select({
          id: bookings.id,
          user_id: bookings.user_id,
          hotel_id: bookings.hotel_id,
          check_in_date: bookings.check_in_date,
          check_out_date: bookings.check_out_date,
          total_price: bookings.total_price,
          currency: bookings.currency,
          payment_status: bookings.payment_status,
          tx_ref: bookings.tx_ref,
          cancelled: bookings.cancelled,
          created_at: bookings.created_at,
          hotel_name: hotels.name,
          hotel_address: hotels.street_address,
          hotel_city: hotels.city,
          hotel_country: hotels.country,
        })
        .from(bookings)
        .leftJoin(hotels, eq(bookings.hotel_id, hotels.id))
        .where(
          and(
            eq(bookings.id, bookingId),
            eq(bookings.user_id, userId)
          )
        )
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const rooms = await this.getBookingRooms(bookingId);

      return {
        ...result[0],
        rooms
      } as BookingDetails;
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      throw error;
    }
  }

  // Get rooms for a booking
  private async getBookingRooms(bookingId: string) {
    try {
      const rooms = await database
        .select({
          room_type: room.type,
          num_rooms: bookingRoomTypes.num_rooms,
          num_guests: bookingRoomTypes.num_guests,
        })
        .from(bookingRoomTypes)
        .leftJoin(room, eq(bookingRoomTypes.roomTypeId, room.id))
        .where(eq(bookingRoomTypes.booking_id, bookingId));

      return rooms;
    } catch (error) {
      console.error('Error fetching booking rooms:', error);
      return [];
    }
  }

  // Generate invoice for a booking
  async generateInvoice(bookingId: string, userId: string): Promise<Invoice | null> {
    try {
      const booking = await this.getBookingById(bookingId, userId);

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

        return {
          ...room,
          price_per_night: pricePerNight.toFixed(2),
          subtotal: subtotal_room.toFixed(2)
        };
      });

      const invoice: Invoice = {
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
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }
}
