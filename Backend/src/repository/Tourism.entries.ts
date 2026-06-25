import { Request } from 'express';
import { database } from '../utils/config/database';
import { tourismEntries, itineraries, userTable } from '../utils/config/schema';
import { eq, ilike, or, and } from 'drizzle-orm';
import { HttpStatusCodes } from '../utils/helpers';
import { DataResponse } from '../utils/types';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const ITINERARY_MAX_TOKENS = 3000;
const ITINERARY_MAX_CONTINUATIONS = 1;
const CONTEXT_ENTRY_LIMIT = 45;
const DESCRIPTION_LIMIT = 180;

const interestKeywords: Record<string, string[]> = {
  wildlife: ['wildlife', 'gorilla', 'monkey', 'chimpanzee', 'nyungwe', 'akagera', 'volcanoes', 'safari', 'permit'],
  culture: ['culture', 'community', 'heritage', 'museum', 'dance', 'craft', 'pottery', 'historical'],
  nature: ['nature', 'park', 'forest', 'lake', 'volcano', 'trail', 'waterfall', 'canopy', 'scenic'],
  adventure: ['adventure', 'hike', 'trek', 'kayak', 'cycling', 'canopy', 'trail', 'activity'],
  history: ['history', 'historical', 'museum', 'heritage', 'memorial', 'genocide'],
  food: ['food', 'coffee', 'restaurant', 'market', 'culinary'],
  relaxation: ['relaxation', 'lake', 'beach', 'spa', 'resort', 'retreat', 'lodge'],
};

const truncate = (value: string | null | undefined, limit = DESCRIPTION_LIMIT) => {
  if (!value) return '';
  return value.length <= limit ? value : `${value.slice(0, limit - 1).trim()}...`;
};

const normalizeInterests = (interests: unknown): string[] =>
  Array.isArray(interests)
    ? interests.map((interest) => String(interest).toLowerCase()).filter(Boolean)
    : [];

type TourismEntry = typeof tourismEntries.$inferSelect;

const scoreEntry = (entry: TourismEntry, interests: string[]) => {
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
      if (searchable.includes(keyword)) score += 4;
    }
  }

  if (entry.category === 'accommodation') score += 2;
  if (entry.category === 'transport') score += 2;
  if (entry.category === 'permit') score += 1;
  if ((entry.priceUSD || 0) > 0 || (entry.priceRWF || 0) > 0) score += 1;

  return score;
};

const selectRelevantEntries = (entries: TourismEntry[], interests: string[]) => {
  const ranked = [...entries].sort((a, b) => scoreEntry(b, interests) - scoreEntry(a, interests));
  const selected = new Map<string, TourismEntry>();

  const addEntries = (items: TourismEntry[], limit: number) => {
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

type NewEntry = typeof tourismEntries.$inferInsert;

class TourismRepository {

  // Get all entries with optional filters
  async getAllEntries(req: Request): Promise<DataResponse> {
    try {
      const { category, search } = req.query;

      let query = database.select().from(tourismEntries);

      if (category && search) {
        query = query.where(
          and(
            eq(tourismEntries.category, category as any),
            or(
              ilike(tourismEntries.name, `%${search}%`),
              ilike(tourismEntries.location, `%${search}%`)
            )
          )
        ) as any;
      } else if (category) {
        query = query.where(eq(tourismEntries.category, category as any)) as any;
      } else if (search) {
        query = query.where(
          or(
            ilike(tourismEntries.name, `%${search}%`),
            ilike(tourismEntries.location, `%${search}%`)
          )
        ) as any;
      }

      const entries = await query;
      return { data: entries, status: HttpStatusCodes.OK, message: 'Entries fetched successfully' };
    } catch (error) {
      return { data: null, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
    }
  }

  // Create entry (admin only)
  async createEntry(req: Request): Promise<DataResponse> {
    try {
      const userId = req.user?.id;
      const payload: NewEntry = {
        ...req.body,
        createdBy: userId,
      };
      const [created] = await database.insert(tourismEntries).values(payload).returning();
      return { data: created, status: HttpStatusCodes.CREATED, message: 'Entry created' };
    } catch (error) {
      return { data: null, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
    }
  }

  // Update entry
  async updateEntry(req: Request): Promise<DataResponse> {
    try {
      const { id } = req.params;
      const [updated] = await database
        .update(tourismEntries)
        .set({ ...req.body, updated_at: new Date() })
        .where(eq(tourismEntries.id, id))
        .returning();
      return { data: updated, status: HttpStatusCodes.OK, message: 'Entry updated' };
    } catch (error) {
      return { data: null, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
    }
  }

  // Delete entry
  async deleteEntry(req: Request): Promise<DataResponse> {
    try {
      const { id } = req.params;
      const [deleted] = await database
        .delete(tourismEntries)
        .where(eq(tourismEntries.id, id))
        .returning();
      return { data: deleted, status: HttpStatusCodes.OK, message: 'Entry deleted' };
    } catch (error) {
      return { data: null, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
    }
  }

  // Generate itinerary using Claude + Rwanda tourism data (RAG)
  async generateItinerary(req: Request): Promise<DataResponse> {
    try {
      const userId = req.user?.id;
      const { travelDates, budget, groupSize, interests, durationDays } = req.body;
      const normalizedInterests = normalizeInterests(interests);
      const requestedDays = Math.max(1, parseInt(durationDays) || 3);
      const requestedGroupSize = Math.max(1, parseInt(groupSize) || 1);

      // Fetch relevant tourism data from database
      const allEntries = await database.select().from(tourismEntries);
      const relevantEntries = selectRelevantEntries(allEntries, normalizedInterests);

      // Build context from database (RAG)
      const context = relevantEntries.map(e =>
        `[${e.category.toUpperCase()}] ${e.name} | ${e.location || 'Rwanda'} | ${truncate(e.description)} | ${e.priceUSD || 0} USD / ${e.priceRWF || 0} RWF | Contact: ${e.bookingContact || 'N/A'} | Tags: ${(e.tags || []).join(', ')}`
      ).join('\n');

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
      let messages: any[] = [{ role: 'user', content: prompt }];

      for (let attempt = 0; attempt <= ITINERARY_MAX_CONTINUATIONS; attempt += 1) {
        const response = await anthropic.messages.create({
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
            content:
              'Continue exactly from where you stopped. Do not restart, do not repeat earlier sections, and finish the remaining itinerary days, cost tables, final trip total, and END OF ITINERARY line.'
          }
        ];
      }

      itineraryText = itineraryText.replace(/\n?END OF ITINERARY\s*$/i, '').trim();

      if (!itineraryText.trim()) {
        return {
          data: null,
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Itinerary generation returned an empty response'
        };
      }

      // Save to database
      const [saved] = await database.insert(itineraries).values({
        userId: userId!,
        rawText: itineraryText,
        travelDates,
        budget,
        groupSize: requestedGroupSize,
        interests: normalizedInterests,
        durationDays: requestedDays,
      }).returning();

      return {
        data: { itinerary: itineraryText, id: saved.id },
        status: HttpStatusCodes.CREATED,
        message: 'Itinerary generated successfully'
      };
    } catch (error) {
      return { data: null, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
    }
  }

  // Get saved itineraries for user
  async getSavedItineraries(req: Request): Promise<DataResponse> {
    try {
      const userId = req.user?.id;
      const saved = await database
        .select()
        .from(itineraries)
        .where(eq(itineraries.userId, userId!));
      return { data: saved, status: HttpStatusCodes.OK, message: 'Itineraries fetched' };
    } catch (error) {
      return { data: null, status: HttpStatusCodes.INTERNAL_SERVER_ERROR, message: `Error: ${error}` };
    }
  }
}

export const tourismRepository = new TourismRepository();
