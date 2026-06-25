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
const ITINERARY_MAX_TOKENS = 3000;
const ITINERARY_MAX_CONTINUATIONS = 1;
const CONTEXT_ENTRY_LIMIT = 45;
const DESCRIPTION_LIMIT = 180;
const interestKeywords = {
    wildlife: ['wildlife', 'gorilla', 'monkey', 'chimpanzee', 'nyungwe', 'akagera', 'volcanoes', 'safari', 'permit'],
    culture: ['culture', 'community', 'heritage', 'museum', 'dance', 'craft', 'pottery', 'historical'],
    nature: ['nature', 'park', 'forest', 'lake', 'volcano', 'trail', 'waterfall', 'canopy', 'scenic'],
    adventure: ['adventure', 'hike', 'trek', 'kayak', 'cycling', 'canopy', 'trail', 'activity'],
    history: ['history', 'historical', 'museum', 'heritage', 'memorial', 'genocide'],
    food: ['food', 'coffee', 'restaurant', 'market', 'culinary'],
    relaxation: ['relaxation', 'lake', 'beach', 'spa', 'resort', 'retreat', 'lodge'],
};
const truncate = (value, limit = DESCRIPTION_LIMIT) => {
    if (!value)
        return '';
    return value.length <= limit ? value : `${value.slice(0, limit - 1).trim()}...`;
};
const normalizeInterests = (interests) => Array.isArray(interests)
    ? interests.map((interest) => String(interest).toLowerCase()).filter(Boolean)
    : [];
const scoreEntry = (entry, interests) => {
    const searchable = [
        entry.name,
        entry.location,
        entry.description,
        entry.category,
        ...(entry.tags || []),
    ].join(' ').toLowerCase();
    let score = 0;
    for (const interest of interests) {
        const keywords = interestKeywords[interest] || [interest];
        for (const keyword of keywords) {
            if (searchable.includes(keyword))
                score += 4;
        }
    }
    if (entry.category === 'accommodation')
        score += 2;
    if (entry.category === 'transport')
        score += 2;
    if (entry.category === 'permit')
        score += 1;
    if ((entry.priceUSD || 0) > 0 || (entry.priceRWF || 0) > 0)
        score += 1;
    return score;
};
const selectRelevantEntries = (entries, interests) => {
    const ranked = [...entries].sort((a, b) => scoreEntry(b, interests) - scoreEntry(a, interests));
    const selected = new Map();
    const addEntries = (items, limit) => {
        for (const item of items.slice(0, limit)) {
            selected.set(item.id, item);
        }
    };
    addEntries(entries.filter((entry) => entry.category === 'accommodation'), 10);
    addEntries(entries.filter((entry) => entry.category === 'transport'), 8);
    addEntries(entries.filter((entry) => entry.category === 'permit'), 8);
    addEntries(ranked, CONTEXT_ENTRY_LIMIT);
    return Array.from(selected.values()).slice(0, CONTEXT_ENTRY_LIMIT);
};
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
                const normalizedInterests = normalizeInterests(interests);
                const requestedDays = Math.max(1, parseInt(durationDays) || 3);
                const requestedGroupSize = Math.max(1, parseInt(groupSize) || 1);
                // Fetch relevant tourism data from database
                const allEntries = yield database_1.database.select().from(schema_1.tourismEntries);
                const relevantEntries = selectRelevantEntries(allEntries, normalizedInterests);
                // Build context from database (RAG)
                const context = relevantEntries.map(e => `[${e.category.toUpperCase()}] ${e.name} | ${e.location || 'Rwanda'} | ${truncate(e.description)} | ${e.priceUSD || 0} USD / ${e.priceRWF || 0} RWF | Contact: ${e.bookingContact || 'N/A'} | Tags: ${(e.tags || []).join(', ')}`).join('\n');
                const prompt = `You are a Rwanda travel expert. Using ONLY the verified Rwanda tourism data below, create a complete but concise ${requestedDays}-day itinerary.

VERIFIED RWANDA TOURISM DATA:
${context}

TRAVELER PREFERENCES:
- Travel dates: ${travelDates || 'flexible'}
- Budget: ${budget || 'moderate'}
- Group size: ${requestedGroupSize} person(s)
- Interests: ${normalizedInterests.join(', ') || 'general tourism'}
- Duration: ${requestedDays} days

Rules:
- Only recommend places listed in the verified data above.
- Keep each day concise: route/header, accommodation, morning, afternoon, evening, and daily costs.
- Include costs in both USD and RWF.
- Include one final trip total.
- Do not include long explanations, source commentary, or duplicate sections.
- End with the exact line: END OF ITINERARY`;
                let itineraryText = '';
                let messages = [{ role: 'user', content: prompt }];
                for (let attempt = 0; attempt <= ITINERARY_MAX_CONTINUATIONS; attempt += 1) {
                    const response = yield anthropic.messages.create({
                        model: 'claude-sonnet-4-6',
                        max_tokens: ITINERARY_MAX_TOKENS,
                        messages
                    });
                    const chunk = response.content
                        .filter((content) => content.type === 'text')
                        .map((content) => content.text)
                        .join('\n')
                        .trim();
                    itineraryText = [itineraryText, chunk].filter(Boolean).join('\n\n');
                    if (response.stop_reason !== 'max_tokens') {
                        break;
                    }
                    messages = [
                        { role: 'user', content: prompt },
                        { role: 'assistant', content: itineraryText },
                        {
                            role: 'user',
                            content: 'Continue exactly from where you stopped. Do not restart, do not repeat earlier sections, and finish the remaining itinerary days, cost tables, final trip total, and END OF ITINERARY line.'
                        }
                    ];
                }
                itineraryText = itineraryText.replace(/\n?END OF ITINERARY\s*$/i, '').trim();
                if (!itineraryText.trim()) {
                    return {
                        data: null,
                        status: helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR,
                        message: 'Itinerary generation returned an empty response'
                    };
                }
                // Save to database
                const [saved] = yield database_1.database.insert(schema_1.itineraries).values({
                    userId: userId,
                    rawText: itineraryText,
                    travelDates,
                    budget,
                    groupSize: requestedGroupSize,
                    interests: normalizedInterests,
                    durationDays: requestedDays,
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
