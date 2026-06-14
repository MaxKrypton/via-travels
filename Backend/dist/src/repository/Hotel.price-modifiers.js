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
exports.priceModifierOperation = void 0;
const helpers_1 = require("../utils/helpers");
const database_1 = require("../utils/config/database");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../utils/config/schema");
class PriceModifierOperations {
    createPriceModifier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomTypeId = req.params.roomTypeId;
            try {
                const modifierData = {
                    roomTypeId: roomTypeId,
                    percentage: req.body.percentage,
                    start_date: new Date(req.body.start_date),
                    end_date: new Date(req.body.end_date)
                };
                const [createdModifier] = yield database_1.database
                    .insert(schema_1.priceModifiers)
                    .values(modifierData)
                    .returning();
                return {
                    data: createdModifier,
                    message: "Price modifier created successfully",
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
    getPriceModifiersByroomTypeId(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomTypeId = req.params.roomTypeId;
            try {
                const modifiers = yield database_1.database
                    .select()
                    .from(schema_1.priceModifiers)
                    .where((0, drizzle_orm_1.eq)(schema_1.priceModifiers.roomTypeId, roomTypeId));
                return {
                    data: modifiers,
                    message: "Price modifiers fetched successfully",
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
    getHotDeals(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [hotelDiscounts] = yield database_1.database
                    .select({
                    hotelId: schema_1.hotels.id,
                    hotelName: schema_1.hotels.name,
                    hotelAddress: (0, drizzle_orm_1.sql) `concat(${schema_1.hotels.street_address}, ', ', ${schema_1.hotels.city}, ', ', ${schema_1.hotels.state}, ', ', ${schema_1.hotels.country})`,
                    discountPercentage: schema_1.priceModifiers.percentage,
                    discountStartDate: schema_1.priceModifiers.start_date,
                    discountEndDate: schema_1.priceModifiers.end_date,
                    shortDescription: schema_1.hotels.short_description,
                    longDescription: schema_1.hotels.long_description,
                })
                    .from(schema_1.hotels)
                    .innerJoin(schema_1.room, (0, drizzle_orm_1.eq)(schema_1.room.hotel_id, schema_1.hotels.id))
                    .innerJoin(schema_1.priceModifiers, (0, drizzle_orm_1.eq)(schema_1.priceModifiers.roomTypeId, schema_1.room.id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.priceModifiers.end_date, new Date())))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.priceModifiers.percentage));
                return {
                    data: hotelDiscounts,
                    message: "Price modifiers fetched successfully",
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
    updatePriceModifier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roomTypeId, discountId } = req.params;
            const updateData = req.body;
            try {
                const updatedData = Object.assign(Object.assign({}, updateData), { updated_at: new Date(), start_date: updateData.start_date ? new Date(updateData.start_date) : undefined, end_date: updateData.end_date ? new Date(updateData.end_date) : undefined });
                const [updatedModifier] = yield database_1.database
                    .update(schema_1.priceModifiers)
                    .set(updatedData)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.priceModifiers.roomTypeId, roomTypeId), (0, drizzle_orm_1.eq)(schema_1.priceModifiers.id, discountId)))
                    .returning();
                if (!updatedModifier) {
                    return {
                        data: null,
                        message: "Price modifier not found",
                        status: helpers_1.HttpStatusCodes.NOT_FOUND
                    };
                }
                return {
                    data: updatedModifier,
                    message: "Price modifier updated successfully",
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
    deletePriceModifier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roomTypeId, discountId } = req.params;
            try {
                const [deletedModifier] = yield database_1.database
                    .delete(schema_1.priceModifiers)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.priceModifiers.roomTypeId, roomTypeId), (0, drizzle_orm_1.eq)(schema_1.priceModifiers.id, discountId)))
                    .returning();
                if (!deletedModifier) {
                    return {
                        data: null,
                        message: "Price modifier not found",
                        status: helpers_1.HttpStatusCodes.NOT_FOUND
                    };
                }
                return {
                    data: deletedModifier,
                    message: "Price modifier deleted successfully",
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
exports.priceModifierOperation = new PriceModifierOperations();
