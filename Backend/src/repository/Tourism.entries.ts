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
const RWF_PER_USD_ESTIMATE = 1300;
const SUPPORTED_ITINERARY_CURRENCIES = ['RWF', 'USD'] as const;

type ItineraryCurrency = (typeof SUPPORTED_ITINERARY_CURRENCIES)[number];

type BudgetTier = 'budget' | 'mid-range' | 'luxury' | 'flexible';

type BudgetProfile = {
  raw: string;
  currency: ItineraryCurrency;
  tier: BudgetTier;
  amountUSD?: number;
  perPersonPerDayUSD?: number;
  guidance: string;
};

const interestKeywords: Record<string, string[]> = {
  wildlife: ['wildlife', 'gorilla', 'monkey', 'chimpanzee', 'nyungwe', 'akagera', 'volcanoes', 'safari', 'permit'],
  culture: ['culture', 'community', 'heritage', 'museum', 'dance', 'craft', 'pottery', 'historical', 'art', 'market'],
  nature: ['nature', 'park', 'forest', 'lake', 'volcano', 'trail', 'waterfall', 'canopy', 'scenic'],
  adventure: ['adventure', 'hike', 'trek', 'kayak', 'cycling', 'canopy', 'trail', 'activity'],
  history: ['history', 'historical', 'museum', 'heritage', 'memorial', 'genocide'],
  food: ['food', 'coffee', 'restaurant', 'market', 'culinary', 'agritourism'],
  relaxation: ['relaxation', 'lake', 'beach', 'spa', 'resort', 'retreat', 'lodge'],
  art: ['art', 'gallery', 'craft', 'dance', 'culture'],
  coffee: ['coffee', 'coffee-tour', 'agritourism', 'food'],
  markets: ['market', 'markets', 'crafts', 'shopping', 'local'],
  hiking: ['hiking', 'hike', 'trail', 'trek', 'multi-day-trek', 'canopy'],
  'lake kivu': ['lake-kivu', 'lake kivu', 'rubavu', 'karongi', 'beach', 'boat', 'relaxation'],
  'gorilla trekking': ['gorilla', 'gorilla-trekking', 'volcanoes-national-park', 'volcanoes', 'permit'],
};

const budgetSignals: Record<Exclude<BudgetTier, 'flexible'>, string[]> = {
  budget: ['budget', 'affordable', 'guesthouse', 'guest-house', 'bus', 'moto', 'free', 'low-cost'],
  'mid-range': ['mid-range', 'boutique', 'comfortable', '3-star', 'moderate'],
  luxury: ['luxury', 'upscale', 'upper-range', 'resort', 'lodge', '5-star', '4-star', 'private', 'premium'],
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

const normalizeCurrency = (currency: unknown): ItineraryCurrency => {
  const normalized = String(currency || '').trim().toUpperCase();
  return SUPPORTED_ITINERARY_CURRENCIES.includes(normalized as ItineraryCurrency)
    ? (normalized as ItineraryCurrency)
    : 'RWF';
};

const getBudgetCurrency = (raw: string, preferredCurrency: ItineraryCurrency): ItineraryCurrency => {
  const normalized = raw.toLowerCase();
  if (normalized.includes('usd') || normalized.includes('$')) return 'USD';
  if (normalized.includes('rwf') || normalized.includes('frw')) return 'RWF';
  return preferredCurrency;
};

const convertUSDToCurrency = (amountUSD: number, currency: ItineraryCurrency) =>
  currency === 'RWF' ? amountUSD * RWF_PER_USD_ESTIMATE : amountUSD;

const formatCurrencyAmount = (amountUSD: number, currency: ItineraryCurrency) => {
  const converted = convertUSDToCurrency(amountUSD, currency);
  if (currency === 'RWF') return `FRW ${Math.round(converted).toLocaleString('en-US')}`;
  return `$${converted.toFixed(2)}`;
};

const parseBudgetProfile = (
  budget: unknown,
  days: number,
  groupSize: number,
  preferredCurrency: ItineraryCurrency,
): BudgetProfile => {
  const raw = String(budget || '').trim();
  const currency = getBudgetCurrency(raw, preferredCurrency);
  const numericValue = Number((raw.match(/[\d,.]+/)?.[0] || '').replace(/,/g, ''));
  const hasNumericBudget = Number.isFinite(numericValue) && numericValue > 0;
  const amountUSD = hasNumericBudget
    ? currency === 'RWF'
      ? numericValue / RWF_PER_USD_ESTIMATE
      : numericValue
    : undefined;
  const perPersonPerDayUSD = amountUSD ? amountUSD / Math.max(1, days) / Math.max(1, groupSize) : undefined;

  let tier: BudgetTier = 'flexible';
  if (perPersonPerDayUSD !== undefined) {
    if (perPersonPerDayUSD < 80) tier = 'budget';
    else if (perPersonPerDayUSD < 220) tier = 'mid-range';
    else tier = 'luxury';
  } else if (/(budget|cheap|affordable|low)/i.test(raw)) {
    tier = 'budget';
  } else if (/(luxury|premium|high|upscale)/i.test(raw)) {
    tier = 'luxury';
  } else if (/(moderate|mid|medium)/i.test(raw)) {
    tier = 'mid-range';
  }

  const guidanceByTier: Record<BudgetTier, string> = {
    budget:
      'Prioritize free/low-cost attractions, guesthouses, public transport, markets, and lower-cost wildlife alternatives. Do not include expensive permits unless they clearly fit the stated budget.',
    'mid-range':
      'Balance comfort and cost: mid-range hotels, selective paid activities, and private transfers only where they materially improve the route.',
    luxury:
      'Use premium lodges/hotels, private transfers, flagship permits, and more comfort-forward pacing where verified data supports it.',
    flexible:
      'Use a balanced mix of costs and explain trade-offs where a premium activity is included.',
  };

  return {
    raw: raw || 'moderate',
    currency,
    tier,
    amountUSD,
    perPersonPerDayUSD,
    guidance: guidanceByTier[tier],
  };
};

const getEntryPriceUSD = (entry: TourismEntry) => {
  if (entry.priceUSD && entry.priceUSD > 0) return entry.priceUSD;
  if (entry.priceRWF && entry.priceRWF > 0) return entry.priceRWF / RWF_PER_USD_ESTIMATE;
  return 0;
};

const formatEntryPrice = (entry: TourismEntry, currency: ItineraryCurrency) => {
  const entryPriceUSD = getEntryPriceUSD(entry);
  if (entryPriceUSD <= 0) return `No listed cost in ${currency}`;
  return formatCurrencyAmount(entryPriceUSD, currency);
};

const getSearchableEntryText = (entry: TourismEntry) =>
  [
    entry.name,
    entry.location,
    entry.description,
    entry.category,
    ...(entry.tags || []),
  ].join(' ').toLowerCase();

const getEntryInterestMatches = (entry: TourismEntry, interests: string[]) => {
  const searchable = getSearchableEntryText(entry);
  return interests.filter((interest) => {
    const keywords = interestKeywords[interest] || [interest];
    return keywords.some((keyword) => searchable.includes(keyword));
  });
};

const getLocationKey = (entry: TourismEntry) => {
  const location = (entry.location || 'rwanda').toLowerCase();
  if (location.includes('kigali')) return 'kigali';
  if (location.includes('musanze') || location.includes('volcano')) return 'musanze/volcanoes';
  if (location.includes('nyungwe')) return 'nyungwe';
  if (location.includes('akagera')) return 'akagera';
  if (location.includes('rubavu') || location.includes('kivu') || location.includes('karongi')) return 'lake-kivu';
  if (location.includes('huye') || location.includes('nyanza')) return 'southern-cultural';
  return location.split(',')[0].trim() || 'rwanda';
};

const scoreEntry = (entry: TourismEntry, interests: string[], budgetProfile: BudgetProfile) => {
  const searchable = [
    entry.name,
    entry.location,
    entry.description,
    entry.category,
    ...(entry.tags || []),
  ].join(' ').toLowerCase();

  let score = 0;
  const interestMatches = getEntryInterestMatches(entry, interests);
  score += interestMatches.length * 10;

  for (const interest of interests) {
    const keywords = interestKeywords[interest] || [interest];
    for (const keyword of keywords) {
      if (searchable.includes(keyword)) score += 4;
    }
  }

  if (entry.category === 'activity') score += 5;
  if (entry.category === 'attraction') score += 5;
  if (entry.category === 'accommodation') score += 3;
  if (entry.category === 'transport') score += 2;
  if (entry.category === 'permit') score += 1;
  if ((entry.priceUSD || 0) > 0 || (entry.priceRWF || 0) > 0) score += 1;

  const tierSignals = budgetProfile.tier === 'flexible' ? [] : budgetSignals[budgetProfile.tier];
  for (const signal of tierSignals) {
    if (searchable.includes(signal)) score += 5;
  }

  const entryPriceUSD = getEntryPriceUSD(entry);
  if (budgetProfile.perPersonPerDayUSD && entryPriceUSD > 0) {
    if (entryPriceUSD <= budgetProfile.perPersonPerDayUSD * 0.4) score += 5;
    if (entryPriceUSD <= budgetProfile.perPersonPerDayUSD) score += 3;
    if (entryPriceUSD > budgetProfile.perPersonPerDayUSD * 1.5) score -= 8;
    if (entryPriceUSD > budgetProfile.perPersonPerDayUSD * 3) score -= 14;
  }

  if (budgetProfile.tier === 'budget') {
    if (entry.category === 'permit' && entryPriceUSD >= 200) score -= 16;
    if (searchable.includes('private')) score -= 5;
    if (entryPriceUSD === 0) score += 4;
  }

  if (budgetProfile.tier === 'luxury') {
    if (entry.category === 'transport' && searchable.includes('bus')) score -= 5;
    if (entry.category === 'accommodation' && searchable.includes('budget')) score -= 8;
  }

  return score;
};

const selectRelevantEntries = (
  entries: TourismEntry[],
  interests: string[],
  budgetProfile: BudgetProfile,
) => {
  const ranked = [...entries].sort((a, b) => scoreEntry(b, interests, budgetProfile) - scoreEntry(a, interests, budgetProfile));
  const selected: TourismEntry[] = [];
  const selectedIds = new Set<string>();
  const categoryCounts = new Map<string, number>();
  const locationCounts = new Map<string, number>();
  const categoryCaps: Record<string, number> = {
    attraction: 14,
    activity: 14,
    accommodation: 9,
    transport: 6,
    permit: 5,
  };

  const pushEntry = (entry: TourismEntry, enforceCaps = true) => {
    if (selectedIds.has(entry.id) || selected.length >= CONTEXT_ENTRY_LIMIT) return;

    const category = entry.category || 'other';
    const locationKey = getLocationKey(entry);
    const categoryCount = categoryCounts.get(category) || 0;
    const locationCount = locationCounts.get(locationKey) || 0;

    if (enforceCaps && categoryCaps[category] && categoryCount >= categoryCaps[category]) return;
    if (enforceCaps && category === 'accommodation' && locationCount >= 3) return;
    if (enforceCaps && (category === 'activity' || category === 'attraction') && locationCount >= 6) return;

    selected.push(entry);
    selectedIds.add(entry.id);
    categoryCounts.set(category, categoryCount + 1);
    locationCounts.set(locationKey, locationCount + 1);
  };

  for (const interest of interests) {
    const interestRanked = ranked.filter((entry) => getEntryInterestMatches(entry, [interest]).length > 0);
    interestRanked.slice(0, 4).forEach((entry) => pushEntry(entry));
  }

  const addCategory = (category: string, limit: number) => {
    ranked
      .filter((entry) => entry.category === category)
      .slice(0, limit)
      .forEach((entry) => pushEntry(entry));
  };

  addCategory('activity', 14);
  addCategory('attraction', 14);
  addCategory('accommodation', 12);
  addCategory('transport', 8);
  addCategory('permit', 6);

  ranked.forEach((entry) => pushEntry(entry));
  ranked.forEach((entry) => pushEntry(entry, false));

  return selected.slice(0, CONTEXT_ENTRY_LIMIT);
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
      const { travelDates, budget, groupSize, interests, durationDays, currency } = req.body;
      const normalizedInterests = normalizeInterests(interests);
      const requestedDays = Math.max(1, parseInt(durationDays) || 3);
      const requestedGroupSize = Math.max(1, parseInt(groupSize) || 1);
      const preferredCurrency = normalizeCurrency(currency);
      const budgetProfile = parseBudgetProfile(budget, requestedDays, requestedGroupSize, preferredCurrency);
      const perPersonPerDayLabel = budgetProfile.perPersonPerDayUSD
        ? `, about ${formatCurrencyAmount(budgetProfile.perPersonPerDayUSD, preferredCurrency)} per person per day`
        : '';

      // Fetch relevant tourism data from database
      const allEntries = await database.select().from(tourismEntries);
      const relevantEntries = selectRelevantEntries(allEntries, normalizedInterests, budgetProfile);

      // Build context from database (RAG)
      const context = relevantEntries.map(e =>
        `[${e.category.toUpperCase()}] ${e.name} | ${e.location || 'Rwanda'} | ${truncate(e.description)} | Price: ${formatEntryPrice(e, preferredCurrency)} | Contact: ${e.bookingContact || 'N/A'} | Tags: ${(e.tags || []).join(', ')}`
      ).join('\n');

      const prompt = `You are a Rwanda travel expert. Using ONLY the verified Rwanda tourism data below, create a complete but concise ${requestedDays}-day itinerary.

VERIFIED RWANDA TOURISM DATA:
${context}

TRAVELER PREFERENCES:
- Travel dates: ${travelDates || 'flexible'}
- Budget: ${budgetProfile.raw}
- Currency for all prices: ${preferredCurrency}
- Budget profile: ${budgetProfile.tier}${perPersonPerDayLabel}
- Budget guidance: ${budgetProfile.guidance}
- Group size: ${requestedGroupSize} person(s)
- Interests: ${normalizedInterests.join(', ') || 'general tourism'}
- Duration: ${requestedDays} days

Rules:
- Only recommend places listed in the verified data above.
- Make the itinerary visibly personalized to the selected interests and budget profile. Different interest/budget combinations should produce meaningfully different destinations, activities, accommodation level, transport style, and pacing.
- Start with a one-line trip theme that names the dominant interest/budget style, for example "Budget culture and food loop" or "Luxury wildlife and lake retreat".
- Cover every selected interest at least once when verified data allows it. If one interest cannot be covered, say so briefly in the notes.
- Keep each day concise: route/header, accommodation, morning, afternoon, evening, why it fits the preferences, and daily costs.
- Avoid repeating the same city/region or the same activity type on consecutive days unless travel logistics require it.
- For budget trips, prefer free/low-cost attractions, public or shared transport, guesthouses, and skip premium permits that would break the budget.
- For mid-range trips, mix signature paid activities with affordable local experiences.
- For luxury trips, use premium accommodation and private transfers where available in the verified data.
- Include all activity, accommodation, transport, daily, and final costs only in ${preferredCurrency}. Do not mix USD and RWF in the itinerary.
- Include one final trip total.
- Include a short "Budget fit" note after the final total explaining whether the plan is under, near, or above the stated budget.
- Do not include long explanations, source commentary, or duplicate sections.
- End with the exact line: END OF ITINERARY`;

      let itineraryText = '';
      let messages: any[] = [{ role: 'user', content: prompt }];

      for (let attempt = 0; attempt <= ITINERARY_MAX_CONTINUATIONS; attempt += 1) {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: ITINERARY_MAX_TOKENS,
          temperature: 0.8,
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
