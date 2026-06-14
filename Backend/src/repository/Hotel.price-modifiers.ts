import { Request } from "express";
import { HttpStatusCodes } from "../utils/helpers";
import { database } from "../utils/config/database";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { DataResponse } from "../utils/types";
import { priceModifiers, room, hotels } from "../utils/config/schema";

// Define types using Drizzle's type inference
type NewPriceModifier = typeof priceModifiers.$inferInsert;
type PriceModifier = typeof priceModifiers.$inferSelect;

class PriceModifierOperations {
  async createPriceModifier(req: Request): Promise<DataResponse> {
    const roomTypeId = req.params.roomTypeId;
    try {
      const modifierData: NewPriceModifier = {
        roomTypeId: roomTypeId,
        percentage: req.body.percentage,
        start_date: new Date(req.body.start_date),
        end_date: new Date(req.body.end_date)
      };

      const [createdModifier] = await database
        .insert(priceModifiers)
        .values(modifierData)
        .returning();

      return {
        data: createdModifier,
        message: "Price modifier created successfully",
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

  async getPriceModifiersByroomTypeId(req: Request): Promise<DataResponse> {
    const roomTypeId = req.params.roomTypeId;

    try {
      const modifiers = await database
        .select()
        .from(priceModifiers)
        .where(eq(priceModifiers.roomTypeId, roomTypeId));

      return {
        data: modifiers,
        message: "Price modifiers fetched successfully",
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

  async getHotDeals(req: Request): Promise<DataResponse> {
    try {
      const [hotelDiscounts] = await database
        .select({
          hotelId: hotels.id,
          hotelName: hotels.name,
          hotelAddress: sql<string>`concat(${hotels.street_address}, ', ', ${hotels.city}, ', ', ${hotels.state}, ', ', ${hotels.country})`,
          discountPercentage: priceModifiers.percentage,
          discountStartDate: priceModifiers.start_date,
          discountEndDate: priceModifiers.end_date,
          shortDescription: hotels.short_description,
          longDescription: hotels.long_description,
        })
        .from(hotels)
        .innerJoin(room, eq(room.hotel_id, hotels.id))
        .innerJoin(priceModifiers, eq(priceModifiers.roomTypeId, room.id))
        .where(
          and(
            gte(priceModifiers.end_date, new Date())
          )
        )
        .orderBy(desc(priceModifiers.percentage))

      return {
        data: hotelDiscounts,
        message: "Price modifiers fetched successfully",
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

  async updatePriceModifier(req: Request): Promise<DataResponse> {
    const { roomTypeId, discountId } = req.params;
    const updateData = req.body;

    try {
      const updatedData: Partial<NewPriceModifier> = {
        ...updateData,
        updated_at: new Date(),
        start_date: updateData.start_date ? new Date(updateData.start_date) : undefined,
        end_date: updateData.end_date ? new Date(updateData.end_date) : undefined
      };

      const [updatedModifier] = await database
        .update(priceModifiers)
        .set(updatedData)
        .where(
          and(
            eq(priceModifiers.roomTypeId, roomTypeId),
            eq(priceModifiers.id, discountId)
          )
        )
        .returning();

      if (!updatedModifier) {
        return {
          data: null,
          message: "Price modifier not found",
          status: HttpStatusCodes.NOT_FOUND
        };
      }

      return {
        data: updatedModifier,
        message: "Price modifier updated successfully",
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

  async deletePriceModifier(req: Request): Promise<DataResponse> {
    const { roomTypeId, discountId } = req.params;

    try {
      const [deletedModifier] = await database
        .delete(priceModifiers)
        .where(
          and(
            eq(priceModifiers.roomTypeId, roomTypeId),
            eq(priceModifiers.id, discountId)
          )
        )
        .returning();

      if (!deletedModifier) {
        return {
          data: null,
          message: "Price modifier not found",
          status: HttpStatusCodes.NOT_FOUND
        };
      }

      return {
        data: deletedModifier,
        message: "Price modifier deleted successfully",
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
}

export const priceModifierOperation = new PriceModifierOperations();
