import { Request } from "express";
import { HttpStatusCodes } from "../utils/helpers";
import { database } from "../utils/config/database";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { DataResponse } from "../utils/types";
import { roomPricing, bookings, room } from "../utils/config/schema";

// Define types using Drizzle's type inference
type NewRoomPricing = typeof roomPricing.$inferInsert;
type RoomPricing = typeof roomPricing.$inferSelect;

class RoomOperations {
  // Room Pricing CRUD Operations
  async createRoomTypePricing(req: Request): Promise<DataResponse> {
    const roomTypeId = req.params.roomTypeId;
    try {
      const pricingData: NewRoomPricing = {
        roomTypeId: roomTypeId,
        roomFee: req.body.roomFee,
        serviceFee: req.body.serviceFee,
        currency: req.body.currency || 'USD',
        tax_percentage: req.body.tax_percentage,
        child_policy: req.body.child_policy
      };

      const [createdPricing] = await database
        .insert(roomPricing)
        .values(pricingData)
        .returning();

      return {
        data: createdPricing,
        message: "Room pricing created successfully",
        status: HttpStatusCodes.CREATED
      };
    } catch (error) {
      return {
        data: null,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getRoomTypePricingByroomTypeId(req: Request): Promise<DataResponse> {
    const roomTypeId = req.params.roomTypeId;

    try {
      const [pricing] = await database
        .select()
        .from(roomPricing)
        .where(eq(roomPricing.roomTypeId, roomTypeId));

      if (!pricing) {
        return {
          data: null,
          message: "Room pricing not found",
          status: HttpStatusCodes.NOT_FOUND
        };
      }

      return {
        data: pricing,
        message: "Room pricing fetched successfully",
        status: HttpStatusCodes.OK
      };
    } catch (error) {
      return {
        data: null,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async updateRoomTypePricing(req: Request): Promise<DataResponse> {
    const { roomTypeId, pricingId } = req.params;
    const updateData = req.body;

    try {
      const updatedData: Partial<NewRoomPricing> = {
        ...updateData,
        updated_at: new Date()
      };

      const [updatedPricing] = await database
        .update(roomPricing)
        .set(updatedData)
        .where(
          and(
            eq(roomPricing.roomTypeId, roomTypeId),
            eq(roomPricing.id, pricingId)
          )
        )
        .returning();

      if (!updatedPricing) {
        return {
          data: null,
          message: "Room pricing not found",
          status: HttpStatusCodes.NOT_FOUND
        };
      }

      return {
        data: updatedPricing,
        message: "Room pricing updated successfully",
        status: HttpStatusCodes.OK
      };
    } catch (error) {
      return {
        data: null,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async deleteRoomTypePricing(req: Request): Promise<DataResponse> {
    const { roomTypeId, pricingId } = req.params;

    try {
      const [deletedPricing] = await database
        .delete(roomPricing)
        .where(
          and(
            eq(roomPricing.roomTypeId, roomTypeId),
            eq(roomPricing.id, pricingId)
          )
        )
        .returning();

      if (!deletedPricing) {
        return {
          data: null,
          message: "Room pricing not found",
          status: HttpStatusCodes.NOT_FOUND
        };
      }

      return {
        data: deletedPricing,
        message: "Room pricing deleted successfully",
        status: HttpStatusCodes.OK
      };
    } catch (error) {
      return {
        data: null,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  // Room Availability - Simplified to inventory-based system
  async getRoomTypeAvailability(req: Request): Promise<DataResponse> {
    const { roomTypeId } = req.params;
    // const { startDate, endDate, numGuests } = req.body;
    const startDate = req.body.checkInDate;
    const endDate = req.body.checkOutDate;
    const numGuests = req.body.num_guests;
    const numRooms = req.body.num_rooms;



    try {
      // Use the same logic as isRoomAvailableForPeriod for consistency
      const checkStartDate = startDate ? new Date(startDate as string) : new Date();
      const checkEndDate = endDate ? new Date(endDate as string) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      const requestedQuantity = numGuests ? parseInt(numGuests as string) : 1;

      const availabilityResult = await this.isRoomAvailableForPeriod(
        roomTypeId,
        checkStartDate,
        checkEndDate,
        requestedQuantity,
        numRooms
      );

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
        status: HttpStatusCodes.OK
      };
    } catch (error) {
      return {
        data: null,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  }

  async isRoomAvailableForPeriod(
    roomTypeId: string,
    startDate: Date,
    endDate: Date,
    numGuests: number,
    numRooms: number
  ): Promise<{
    available: boolean;
    reason?: string;
    details: {
      roomExists: boolean;
      totalInventory: number;
      availableInventory: number;
      numGuests: number;
      numRooms: number;
      maxOccupancy: number;
      totalCapacity: number;
      hasInventory: boolean;
      validOccupancy: boolean;
    };
    roomInfo?: {
      roomTypeId: string;
      room_type: string;
      hotel_id: string;
      max_occupancy: number;
      total_inventory: number;
      available_inventory: number;
    };
  }> {
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
      const [roomInfo] = await database
        .select({
          roomTypeId: room.id,
          room_type: room.type,
          total_inventory: room.total_inventory,
          available_inventory: room.available_inventory, // Dynamic inventory
          max_occupancy: room.max_occupancy,
          hotel_id: room.hotel_id
        })
        .from(room)
        .where(eq(room.id, roomTypeId))
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

    } catch (error) {
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
  }

  async decreaseRoomInventory(roomTypeId: string, numRooms: number): Promise<boolean> {
    try {
      const result = await database
        .update(room)
        .set({
          available_inventory: sql`${room.available_inventory} - ${numRooms}`,
          updated_at: new Date()
        })
        .where(eq(room.id, roomTypeId))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Error decreasing room inventory:', error);
      return false;
    }
  }

  async increaseRoomInventory(roomTypeId: string, numRooms: number): Promise<boolean> {
    try {
      const result = await database
        .update(room)
        .set({
          available_inventory: sql`${room.available_inventory} + ${numRooms}`,
          updated_at: new Date()
        })
        .where(eq(room.id, roomTypeId))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Error increasing room inventory:', error);
      return false;
    }
  }
}

export const roomOperationsRepository = new RoomOperations();
