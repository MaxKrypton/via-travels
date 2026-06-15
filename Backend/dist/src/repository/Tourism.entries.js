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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tourismRepository = void 0;
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const helpers_1 = require("../utils/helpers");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
class TourismRepository {
    // Get all entries with optional filters
    getAllEntries(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category, search } = req.query;
                let query = database_1.database.select().from(schema_1.tourismEntries);
                if (category && search) {
                    query = query.where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tourismEntries.category, category), (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.tourismEntries.name, `%${search}%`), (0, drizzle_orm_1.ilike)(schema_1.tourismEntries.location, `%${search}%`))));
                }
                else if (category) {
                    query = query.where((0, drizzle_orm_1.eq)(schema_1.tourismEntries.category, category));
                }
                else if (search) {
                    query = query.where((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.tourismEntries.name, `%${search}%`), (0, drizzle_orm_1.ilike)(schema_1.tourismEntries.location, `%${search}%`)));
                }
                const entries = yield query;
                return { data: entries, status: helpers_1.HttpStatusCodes.OK, message: 'Entries fetched successfully' };
            }
            catch (error) {
                return { data: null, status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
            }
        });
    }
    // Create entry (admin only)
    createEntry(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const payload = Object.assign(Object.assign({}, req.body), { createdBy: userId });
                const [created] = yield database_1.database.insert(schema_1.tourismEntries).values(payload).returning();
                return { data: created, status: helpers_1.HttpStatusCodes.CREATED, message: 'Entry created' };
            }
            catch (error) {
                return { data: null, status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
            }
        });
    }
    // Update entry
    updateEntry(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const [updated] = yield database_1.database
                    .update(schema_1.tourismEntries)
                    .set(Object.assign(Object.assign({}, req.body), { updated_at: new Date() }))
                    .where((0, drizzle_orm_1.eq)(schema_1.tourismEntries.id, id))
                    .returning();
                return { data: updated, status: helpers_1.HttpStatusCodes.OK, message: 'Entry updated' };
            }
            catch (error) {
                return { data: null, status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
            }
        });
    }
    // Delete entry
    deleteEntry(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const [deleted] = yield database_1.database
                    .delete(schema_1.tourismEntries)
                    .where((0, drizzle_orm_1.eq)(schema_1.tourismEntries.id, id))
                    .returning();
                return { data: deleted, status: helpers_1.HttpStatusCodes.OK, message: 'Entry deleted' };
            }
            catch (error) {
                return { data: null, status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
            }
        });
    }
    // Generate itinerary using Claude + Rwanda tourism data (RAG)
    generateItinerary(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { travelDates, budget, groupSize, interests, durationDays } = req.body;
                // Fetch relevant tourism data from database
                const allEntries = yield database_1.database.select().from(schema_1.tourismEntries);
                // Build context from database (RAG)
                const context = allEntries.map(e => { var _a; return `[${e.category.toUpperCase()}] ${e.name} — ${e.location} — ${e.description} — Price: ${e.priceUSD}USD / ${e.priceRWF}RWF — Contact: ${e.bookingContact || 'N/A'} — Tags: ${(_a = e.tags) === null || _a === void 0 ? void 0 : _a.join(', ')}`; }).join('\n');
                const prompt = `You are a Rwanda travel expert. Using ONLY the verified Rwanda tourism data below, create a detailed ${durationDays}-day itinerary.

VERIFIED RWANDA TOURISM DATA:
${context}

TRAVELER PREFERENCES:
- Travel dates: ${travelDates || 'flexible'}
- Budget: ${budget || 'moderate'}
- Group size: ${groupSize || 1} person(s)
- Interests: ${(interests === null || interests === void 0 ? void 0 : interests.join(', ')) || 'general tourism'}
- Duration: ${durationDays || 3} days

Create a day-by-day itinerary with specific places from the data above. Include estimated costs in both RWF and USD. Only recommend places listed in the data above.`;
                const response = yield anthropic.messages.create({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 1500,
                    messages: [{ role: 'user', content: prompt }]
                });
                const itineraryText = response.content[0].type === 'text' ? response.content[0].text : '';
                // Save to database
                const [saved] = yield database_1.database.insert(schema_1.itineraries).values({
                    userId: userId,
                    rawText: itineraryText,
                    travelDates,
                    budget,
                    groupSize: parseInt(groupSize) || 1,
                    interests,
                    durationDays: parseInt(durationDays) || 3,
                }).returning();
                return {
                    data: { itinerary: itineraryText, id: saved.id },
                    status: helpers_1.HttpStatusCodes.CREATED,
                    message: 'Itinerary generated successfully'
                };
            }
            catch (error) {
                return { data: null, status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
            }
        });
    }
    // Get saved itineraries for user
    getSavedItineraries(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const saved = yield database_1.database
                    .select()
                    .from(schema_1.itineraries)
                    .where((0, drizzle_orm_1.eq)(schema_1.itineraries.userId, userId));
                return { data: saved, status: helpers_1.HttpStatusCodes.OK, message: 'Itineraries fetched' };
            }
            catch (error) {
                return { data: null, status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
            }
        });
    }
}
exports.tourismRepository = new TourismRepository();
