import { Request } from 'express';
import { database } from '../utils/config/database';
import { tourismEntries, itineraries, userTable } from '../utils/config/schema';
import { eq, ilike, or, and } from 'drizzle-orm';
import { HttpStatusCodes } from '../utils/helpers';
import { DataResponse } from '../utils/types';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

      // Fetch relevant tourism data from database
      const allEntries = await database.select().from(tourismEntries);

      // Build context from database (RAG)
      const context = allEntries.map(e =>
        `[${e.category.toUpperCase()}] ${e.name} — ${e.location} — ${e.description} — Price: ${e.priceUSD}USD / ${e.priceRWF}RWF — Contact: ${e.bookingContact || 'N/A'} — Tags: ${e.tags?.join(', ')}`
      ).join('\n');

      const prompt = `You are a Rwanda travel expert. Using ONLY the verified Rwanda tourism data below, create a detailed ${durationDays}-day itinerary.

VERIFIED RWANDA TOURISM DATA:
${context}

TRAVELER PREFERENCES:
- Travel dates: ${travelDates || 'flexible'}
- Budget: ${budget || 'moderate'}
- Group size: ${groupSize || 1} person(s)
- Interests: ${interests?.join(', ') || 'general tourism'}
- Duration: ${durationDays || 3} days

Create a day-by-day itinerary with specific places from the data above. Include estimated costs in both RWF and USD. Only recommend places listed in the data above.`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      });

      const itineraryText = response.content[0].type === 'text' ? response.content[0].text : '';

      // Save to database
      const [saved] = await database.insert(itineraries).values({
        userId: userId!,
        rawText: itineraryText,
        travelDates,
        budget,
        groupSize: parseInt(groupSize) || 1,
        interests,
        durationDays: parseInt(durationDays) || 3,
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