// Repository (booking.repository.ts)
import { Request, Response } from 'express';
import { HttpStatusCodes } from '../utils/helpers';
import { database } from '../utils/config/database';
import { and, eq, sql, lte, inArray } from 'drizzle-orm';
import { DataResponse } from '../utils/types';
import { bookings, bookingRoomTypes, room } from '../utils/config/schema';
import { roomOperationsRepository } from './Hotel.pricing-availability';
import {
  IFlutterwavePaymentUserDetails,
  paymentRepository,
} from './FlutterwavePayment';
import { hotelRepository } from './Hotels.basic-data';

// Define types using Drizzle's type inference
type NewBooking = typeof bookings.$inferInsert;
type Booking = typeof bookings.$inferSelect;
type BookingRoomType = typeof bookingRoomTypes.$inferSelect;

export interface IBookingPayment {
  amount: number | string;
  currency: string;
  redirect_url?: string;
  name: string;
  email: string;
  phone_number: number | string;
  customizationsTitle: string;
  customizationsDescription: string;
}

class BookingRepository {
  
  async createBooking(req: Request): Promise<DataResponse> {
    const { hotelId } = req.params;
    const userId = req.user?.id as string;
    const checkInDate = new Date(req.body.check_in_date);
    const checkOutDate = new Date(req.body.check_out_date);
    const roomTypes = req.body.roomTypes as {
      roomtypeId: string;
      num_rooms: number;
      num_guests: number;
    }[];
    const preferredCurrency = (req.user?.preferred_currency || 'RWF') as string;
    const total_price = req.body.total_price;

    // Track state for rollback purposes
    let createdBooking: any = null;
    const createdBookingRoomTypes: any[] = [];
    const inventoryUpdates: { roomTypeId: string; numRooms: number }[] = [];

    try {
      let totalRooms = 0;
      let combinedCapacity = 0;
      let totalGuests = 0;

      // Step 1: Sequential availability check for all room types (read-only check first)
      console.log(`Processing multi-booking for user ${userId}: ${roomTypes.length} room types`);

      for (let i = 0; i < roomTypes.length; i++) {
        const { roomtypeId, num_rooms, num_guests } = roomTypes[i];

        console.log(`Checking availability for room type ${i + 1}/${roomTypes.length}: ${roomtypeId}`);

        const availabilityCheck = await roomOperationsRepository.isRoomAvailableForPeriod(
          roomtypeId,
          checkInDate,
          checkOutDate,
          num_guests,
          num_rooms,
        );

        if (!availabilityCheck.available) {
          return {
            data: null,
            message: `Room type ${roomtypeId} is not available: ${availabilityCheck.reason}`,
            status: HttpStatusCodes.BAD_REQUEST,
          };
        }

        totalRooms += num_rooms;
        totalGuests += num_guests;
        combinedCapacity += availabilityCheck.details.totalCapacity;
      }

      console.log(`All ${roomTypes.length} room types are available. Creating booking...`);

      // Step 2: Initialize payment first (before creating booking records)
      const paymentDetails: IFlutterwavePaymentUserDetails = {
        amount: total_price,
        currency: preferredCurrency,
        name: req.user?.username as string,
        email: req.user?.email as string,
        phone_number: req.user?.phone_number || '',
        customizationsTitle: `Hotel Booking - ${totalRooms} Room(s)`,
        customizationsDescription: `Booking for ${totalGuests} guest(s) from ${checkInDate.toDateString()} to ${checkOutDate.toDateString()}`,
      };

      const hotelResponse = await hotelRepository.getHotelById(hotelId);
      const paymentResponse = await paymentRepository.Payment(
        paymentDetails,
        hotelResponse.data.subaccount_id
      ) as DataResponse;

      if (paymentResponse.status !== HttpStatusCodes.OK) {
        return {
          data: null,
          message: `Payment initialization failed: ${paymentResponse.message}`,
          status: paymentResponse.status
        };
      }

      console.log('Payment initialized successfully. Creating booking record...');

      // Step 3: Create the main booking record with pending status
      const bookingData: NewBooking = {
        user_id: userId,
        hotel_id: hotelId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_price,
        currency: preferredCurrency,
        payment_status: 'pending',
        tx_ref: paymentResponse.data?.tx_ref,
      };

      [createdBooking] = await database
        .insert(bookings)
        .values(bookingData)
        .returning();

      console.log(`Booking created with ID: ${createdBooking.id}. Creating room type entries...`);

      // Step 4: Create booking room types entries one by one
      for (let i = 0; i < roomTypes.length; i++) {
        const { roomtypeId, num_rooms, num_guests } = roomTypes[i];

        try {
          const [bookingRoomType] = await database
            .insert(bookingRoomTypes)
            .values({
              booking_id: createdBooking.id,
              roomTypeId: roomtypeId,
              num_rooms,
              num_guests,
            })
            .returning();

          createdBookingRoomTypes.push(bookingRoomType);
          console.log(`Created booking room type entry ${i + 1}/${roomTypes.length}`);

        } catch (error) {
          console.error(`Failed to create booking room type entry for ${roomtypeId}:`, error);
          // Rollback what we've created so far
          await this.rollbackBookingCreation(createdBooking.id, createdBookingRoomTypes, inventoryUpdates);

          return {
            data: null,
            message: `Failed to create booking room type entry: ${error}`,
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          };
        }
      }

      console.log('All booking room type entries created. Updating inventory...');

      // Step 5: Check and reserve inventory for each room type one by one
      for (let i = 0; i < roomTypes.length; i++) {
        const { roomtypeId, num_rooms, num_guests } = roomTypes[i];

        console.log(`Checking and reserving inventory for room type ${i + 1}/${roomTypes.length}: ${roomtypeId}`);

        const reservationResult = await this.checkAndReserveRoomInventory(
          roomtypeId,
          checkInDate,
          checkOutDate,
          num_guests,
          num_rooms
        );

        if (!reservationResult.success) {
          console.error(`Failed to reserve room type ${roomtypeId}: ${reservationResult.reason}`);
          // Rollback everything created so far
          await this.rollbackBookingCreation(createdBooking.id, createdBookingRoomTypes, inventoryUpdates);

          return {
            data: null,
            message: `Failed to reserve room type ${roomtypeId}: ${reservationResult.reason}`,
            status: HttpStatusCodes.BAD_REQUEST,
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
          checkout_url: paymentResponse.data?.checkout_link as string,
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
        status: HttpStatusCodes.CREATED,
      };

    } catch (error: any) {
      console.error('Error in createBooking:', error);

      // Rollback any partial state
      if (createdBooking) {
        await this.rollbackBookingCreation(createdBooking.id, createdBookingRoomTypes, inventoryUpdates);
      }

      return {
        data: null,
        message: `Booking creation failed: ${error?.message || error}`,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
  // Helper method to handle comprehensive rollback
  private async rollbackBookingCreation(
    bookingId: string,
    createdBookingRoomTypes: any[],
    inventoryUpdates: { roomTypeId: string; numRooms: number }[]
  ): Promise<void> {
    console.log(`Rolling back booking creation for booking ID: ${bookingId}`);

    try {
      // Step 1: Restore inventory (reverse order of operations)
      for (const { roomTypeId, numRooms } of inventoryUpdates) {
        try {
          await roomOperationsRepository.increaseRoomInventory(roomTypeId, numRooms);
          console.log(`Restored inventory for room type: ${roomTypeId}`);
        } catch (error) {
          console.error(`Failed to restore inventory for room type ${roomTypeId}:`, error);
        }
      }

      // Step 2: Delete booking room types (if any were created)
      if (createdBookingRoomTypes.length > 0) {
        try {
          await database
            .delete(bookingRoomTypes)
            .where(eq(bookingRoomTypes.booking_id, bookingId));
          console.log(`Deleted ${createdBookingRoomTypes.length} booking room type entries`);
        } catch (error) {
          console.error('Failed to delete booking room types:', error);
        }
      }

      // Step 3: Delete main booking record
      try {
        await database
          .delete(bookings)
          .where(eq(bookings.id, bookingId));
        console.log(`Deleted main booking record: ${bookingId}`);
      } catch (error) {
        console.error('Failed to delete main booking:', error);
      }

    } catch (error) {
      console.error('Error during rollback:', error);
      // Log this for manual intervention
    }
  }
  // Helper method to check and reserve room inventory with better error handling
  private async checkAndReserveRoomInventory(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    numGuests: number,
    numRooms: number
  ): Promise<{
    success: boolean;
    reason?: string;
    details?: {
      totalCapacity: number;
      maxOccupancy: number;
    };
  }> {
    try {
      const availabilityCheck = await roomOperationsRepository.isRoomAvailableForPeriod(
        roomTypeId,
        checkInDate,
        checkOutDate,
        numGuests,
        numRooms,
      );

      if (!availabilityCheck.available) {
        return {
          success: false,
          reason: availabilityCheck.reason
        };
      }

      // If available, attempt to reserve inventory
      const inventoryUpdated = await roomOperationsRepository.decreaseRoomInventory(
        roomTypeId,
        numRooms,
      );

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

    } catch (error) {
      console.error('Error in checkAndReserveRoomInventory:', error);
      return {
        success: false,
        reason: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // method to verify payment status for pending bookings
  async verifyBookingPayment(req: Request): Promise<DataResponse> {
    const { booking_id } = req.params;

    try {
      const [booking] = await database
        .select()
        .from(bookings)
        .where(eq(bookings.id, booking_id));

      if (!booking) {
        return {
          data: null,
          message: 'Booking not found',
          status: HttpStatusCodes.NOT_FOUND,
        };
      }

      if (!booking.tx_ref) {
        return {
          data: null,
          message: 'No transaction reference found for this booking',
          status: HttpStatusCodes.BAD_REQUEST,
        };
      }

      const transactionReference = booking.tx_ref;

      // Verify payment with Flutterwave
      const verificationResponse = (await paymentRepository.verifyPayment(
        transactionReference,
      )) as DataResponse;

      if (verificationResponse.status === HttpStatusCodes.OK) {
        // Only update if not already marked as completed
        if (booking.payment_status !== 'completed') {
          const [updatedBooking] = await database
            .update(bookings)
            .set({
              payment_status: 'completed',
              updated_at: new Date(),
            })
            .where(eq(bookings.id, booking_id))
            .returning();

          return {
            message: `Payment verified and booking ${booking_id} confirmed`,
            status: HttpStatusCodes.OK,
            data: updatedBooking,
          };
        }

        return {
          message: 'Payment already verified for this booking',
          status: HttpStatusCodes.OK,
          data: booking,
        };
      }

      return {
        message: 'Payment verification failed',
        status: HttpStatusCodes.BAD_REQUEST,
      };
    } catch (error) {
      return {
        data: null,
        message:
          error instanceof Error
            ? error.message
            : 'Payment verification failed',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Read - Get All User Bookings (with room types)
  async getUserBookings(req: Request): Promise<DataResponse> {
    const userId = req.params.userId;
    this.processExpiredCheckouts();
    try {
      // Get bookings with their room types
      const userBookings = await database
        .select({
          booking: bookings,
          roomTypes: bookingRoomTypes,
        })
        .from(bookings)
        .leftJoin(
          bookingRoomTypes,
          eq(bookings.id, bookingRoomTypes.booking_id),
        )
        .where(
          and(eq(bookings.user_id, userId), eq(bookings.cancelled, false)),
        );

      // Group room types by booking
      const groupedBookings = userBookings.reduce(
        (acc, item) => {
          const bookingId = item.booking.id;
          if (!acc[bookingId]) {
            acc[bookingId] = {
              ...item.booking,
              room_types: [],
            };
          }
          if (item.roomTypes) {
            acc[bookingId].room_types.push(item.roomTypes);
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      return {
        data: Object.values(groupedBookings),
        message: 'User bookings fetched successfully',
        status: HttpStatusCodes.OK,
      };
    } catch (error) {
      return {
        data: null,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Read - Get Specific Booking (with room types)
  async getSpecificBooking(req: Request): Promise<DataResponse> {
    const bookingId = req.params.bookingId;

    // Free up rooms
    this.processExpiredCheckouts();
    try {
      const [booking] = await database
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId));

      if (!booking) {
        return {
          data: null,
          message: 'Booking not found',
          status: HttpStatusCodes.NOT_FOUND,
        };
      }

      // Get associated room types
      const roomTypesData = await database
        .select()
        .from(bookingRoomTypes)
        .where(eq(bookingRoomTypes.booking_id, bookingId));

      return {
        data: {
          ...booking,
          room_types: roomTypesData,
        },
        message: 'Booking fetched successfully',
        status: HttpStatusCodes.OK,
      };
    } catch (error) {
      return {
        data: null,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Update - Update Booking
  async updateBooking(req: Request): Promise<DataResponse> {
    const bookingId = req.params.bookingId;
    const updateData = req.body;

    // AutoProcess expired checkouts
    this.processExpiredCheckouts();
    try {
      const [existingBooking] = await database
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId));

      if (!existingBooking) {
        return {
          data: null,
          message: 'Booking not found',
          status: HttpStatusCodes.NOT_FOUND,
        };
      }

      const updatedData: Partial<NewBooking> = {
        ...updateData,
        updated_at: new Date(),
      };

      const [updatedBooking] = await database
        .update(bookings)
        .set(updatedData)
        .where(eq(bookings.id, bookingId))
        .returning();

      return {
        data: updatedBooking,
        message: 'Booking updated successfully',
        status: HttpStatusCodes.OK,
      };
    } catch (error) {
      return {
        data: null,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Update - Cancel Booking (Fixed to handle normalized tables)
  async cancelBooking(req: Request): Promise<DataResponse> {
    const bookingId = req.params.bookingId;
    const { cancellation_reason } = req.body;
    // AutoProcess Expired checkouts
    this.processExpiredCheckouts();

    try {
      // Get existing booking
      const [existingBooking] = await database
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId));

      if (!existingBooking) {
        return {
          data: null,
          message: 'Booking not found',
          status: HttpStatusCodes.NOT_FOUND,
        };
      }

      if (existingBooking.cancelled) {
        return {
          data: null,
          message: 'Booking is already cancelled',
          status: HttpStatusCodes.BAD_REQUEST,
        };
      }

      // Get associated room types for inventory update
      const bookingRoomTypesData = await database
        .select()
        .from(bookingRoomTypes)
        .where(eq(bookingRoomTypes.booking_id, bookingId));

      // Cancel booking
      const [cancelledBooking] = await database
        .update(bookings)
        .set({
          cancelled: true,
          cancellation_timestamp: new Date(),
          cancellation_reason,
          updated_at: new Date(),
        })
        .where(eq(bookings.id, bookingId))
        .returning();

      // Update dynamic inventory - increase available rooms for each room type
      let totalRoomsFreed = 0;
      let totalGuestsAffected = 0;

      for (const roomType of bookingRoomTypesData) {
        const inventoryUpdated =
          await roomOperationsRepository.increaseRoomInventory(
            roomType.roomTypeId,
            roomType.num_rooms,
          );

        if (!inventoryUpdated) {
          console.error(
            `Failed to update room inventory after cancellation for room type: ${roomType.roomTypeId}`,
          );
          // Log error but don't fail the cancellation
        } else {
          totalRoomsFreed += roomType.num_rooms;
          totalGuestsAffected += roomType.num_guests;
        }
      }

      return {
        data: {
          ...cancelledBooking,
          room_types: bookingRoomTypesData,
          summary: {
            rooms_freed: totalRoomsFreed,
            guests_affected: totalGuestsAffected,
            booking_period: {
              check_in: existingBooking.check_in_date,
              check_out: existingBooking.check_out_date,
            },
          },
        },
        message: `Booking cancelled: ${totalRoomsFreed} room(s) now available`,
        status: HttpStatusCodes.OK,
      };
    } catch (error) {
      return {
        data: null,
        message: error instanceof Error ? error.message : 'Cancellation failed',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async processExpiredCheckouts(): Promise<number> {
    try {
      const now = new Date();

      // Find all active bookings where checkout time has passed
      const expiredBookings = await database
        .select({
          booking: bookings,
          roomTypes: bookingRoomTypes,
        })
        .from(bookings)
        .leftJoin(
          bookingRoomTypes,
          eq(bookings.id, bookingRoomTypes.booking_id),
        )
        .where(
          and(
            eq(bookings.cancelled, false),
            lte(bookings.check_out_date, now), // Checkout date/time has passed
          ),
        );

      // Group by booking ID
      const groupedExpiredBookings = expiredBookings.reduce(
        (acc, item) => {
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
        },
        {} as Record<string, any>,
      );

      let totalRoomsFreed = 0;

      // Process each expired booking
      for (const { booking, roomTypes } of Object.values(
        groupedExpiredBookings,
      ) as any[]) {
        // Free up rooms for each room type in the booking
        for (const roomType of roomTypes) {
          await database
            .update(room)
            .set({
              available_inventory: sql`${room.available_inventory} + ${roomType.num_rooms}`,
              updated_at: new Date(),
            })
            .where(eq(room.id, roomType.roomTypeId));

          totalRoomsFreed += roomType.num_rooms;
        }

        // Mark booking as processed
        await database
          .update(bookings)
          .set({
            updated_at: new Date(),
          })
          .where(eq(bookings.id, booking.id));
      }

      return totalRoomsFreed;
    } catch (error) {
      console.error('Error processing expired checkouts:', error);
      return 0;
    }
  }

  async processExpiredPendingPayments(): Promise<number> {
    try {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

      // Find all bookings that are:
      // 1. Created more than 30 minutes ago
      // 2. Still have pending payment status
      // 3. Not already cancelled
      const expiredPendingBookings = await database
        .select({
          booking: bookings,
          roomTypes: bookingRoomTypes,
        })
        .from(bookings)
        .leftJoin(
          bookingRoomTypes,
          eq(bookings.id, bookingRoomTypes.booking_id),
        )
        .where(
          and(
            eq(bookings.payment_status, 'pending'),
            eq(bookings.cancelled, false),
            sql`${bookings.created_at} <= ${thirtyMinutesAgo.toISOString()}`, // Created more than 30 minutes ago
          ),
        );

      // Group by booking ID
      const groupedExpiredBookings = expiredPendingBookings.reduce(
        (acc, item) => {
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
        },
        {} as Record<string, any>,
      );

      let totalBookingsProcessed = 0;
      let totalRoomsFreed = 0;

      // Process each expired booking
      for (const { booking, roomTypes } of Object.values(
        groupedExpiredBookings,
      ) as any[]) {
        try {
          // Mark booking as cancelled due to payment timeout
          await database
            .update(bookings)
            .set({
              cancelled: true,
              payment_status: 'failed',
              cancellation_timestamp: new Date(),
              cancellation_reason:
                'Payment timeout - booking expired after 30 minutes',
              updated_at: new Date(),
            })
            .where(eq(bookings.id, booking.id));

          // Free up the rooms by increasing available inventory for each room type
          for (const roomType of roomTypes) {
            const inventoryUpdated =
              await roomOperationsRepository.increaseRoomInventory(
                roomType.roomTypeId,
                roomType.num_rooms,
              );

            if (inventoryUpdated) {
              totalRoomsFreed += roomType.num_rooms;
            } else {
              console.error(
                `Failed to update inventory for expired booking room type: ${roomType.roomTypeId}`,
              );
            }
          }

          totalBookingsProcessed++;
          console.log(
            `Expired booking processed: ${booking.id} - ${roomTypes.reduce((sum: number, rt: any) => sum + rt.num_rooms, 0)} room(s) freed`,
          );
        } catch (error) {
          console.error(
            `Error processing expired booking ${booking.id}:`,
            error,
          );
        }
      }

      if (totalBookingsProcessed > 0) {
        console.log(
          `Processed ${totalBookingsProcessed} expired bookings, freed up ${totalRoomsFreed} room(s)`,
        );
      }

      return totalBookingsProcessed;
    } catch (error) {
      console.error('Error processing expired pending payments:', error);
      return 0;
    }
  }

  async getHotelBookings(req: Request): Promise<DataResponse> {
    try {
      const { hotel_id } = req.query;

      if (!hotel_id) {
        return {
          data: null,
          message: 'Hotel ID is required',
          status: HttpStatusCodes.BAD_REQUEST,
        };
      }

      // Get all bookings for the hotel
      const hotelBookings = await database
        .select()
        .from(bookings)
        .where(eq(bookings.hotel_id, hotel_id as string));

      return {
        data: hotelBookings,
        message: 'Hotel bookings retrieved successfully',
        status: HttpStatusCodes.OK,
      };
    } catch (error: any) {
      console.error('Error fetching hotel bookings:', error);
      return {
        data: null,
        message: `Failed to retrieve hotel bookings: ${error?.message || error}`,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }


}


export const bookingRepository = new BookingRepository();
