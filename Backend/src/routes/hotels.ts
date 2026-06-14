import { Router, Request, Response } from 'express';
import { database } from '../utils/config/database';
import { hotels, room, roomPricing } from '../utils/config/schema';
import { eq } from 'drizzle-orm';
import { HttpStatusCodes } from '../utils/helpers';

const router = Router();

// GET /api/hotels/:hotelId/rooms
router.get('/:hotelId/rooms', async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;

    // Validate hotelId
    if (!hotelId) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        message: 'Hotel ID is required',
      });
    }

    // Get hotel information
    const [hotel] = await database
      .select({
        id: hotels.id,
        name: hotels.name,
      })
      .from(hotels)
      .where(eq(hotels.id, hotelId))
      .limit(1);

    if (!hotel) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        message: 'Hotel not found',
      });
    }

    // Get all rooms for this hotel with their pricing
    const roomsWithPricing = await database
      .select({
        id: room.id,
        type: room.type,
        description: room.description,
        max_occupancy: room.max_occupancy,
        num_beds: room.num_beds,
        room_size: room.room_size,
        total_inventory: room.total_inventory,
        available_inventory: room.available_inventory,
        roomFee: roomPricing.roomFee,
        serviceFee: roomPricing.serviceFee,
      })
      .from(room)
      .leftJoin(roomPricing, eq(room.id, roomPricing.roomTypeId))
      .where(eq(room.hotel_id, hotelId));

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

    return res.status(HttpStatusCodes.OK).json({
      hotelName: hotel.name,
      hotelId: hotel.id,
      rooms: formattedRooms,
    });
  } catch (error) {
    console.error('Error fetching hotel rooms:', error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch hotel rooms',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;