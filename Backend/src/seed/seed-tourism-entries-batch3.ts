import { database } from '../utils/config/database';
import { tourismEntries } from '../utils/config/schema';

// ---------------------------------------------------------------------------
// Pricing shapes used in this batch. Each one mirrors a genuinely different
// real-world pricing structure — that's the whole point of pricing_details
// being jsonb instead of two flat numbers. Move these into a shared types
// file alongside the batch-2 types once you're happy with them.
// ---------------------------------------------------------------------------

/** Entry fees that vary by residency tier AND by length of stay (parks). */
export interface ResidencyNightsTier {
  audience: string; // e.g. 'international_visitor', 'rwandan_eac_citizen'
  ageGroup: 'adult' | 'child_6_to_12' | 'child_under_6_free';
  currency: 'USD' | 'RWF';
  ratesByNights: Record<string, number | null>; // keys: "1","2","3","4to7"
}
export interface TieredResidencyNightsPricing {
  pricingModel: 'tiered_by_residency_and_nights';
  currency: 'USD' | 'RWF' | 'mixed';
  tiers: ResidencyNightsTier[];
  groupDiscount?: string;
  notes?: string;
  source: string;
  sourceDate: string;
}

/** A flat permit fee that varies by residency tier only (no night count). */
export interface ResidencyOnlyTier {
  audience: string;
  adult: number | null;
  studentOrChild: number | null;
  currency: 'USD' | 'RWF';
}
export interface TieredResidencyPricing {
  pricingModel: 'tiered_by_residency';
  currency: 'USD' | 'RWF' | 'mixed';
  tiers: ResidencyOnlyTier[];
  promotionalNote?: string;
  notes?: string;
  source: string;
  sourceDate: string;
}

/** A menu of bookable activities, each with its own unit and adult/child price. */
export interface ActivityListPricing {
  pricingModel: 'activity_price_list';
  currency: 'USD' | 'RWF';
  activities: {
    name: string;
    unit: string;
    adult: number | null;
    child6to12?: number | null;
    notes?: string;
  }[];
  notes?: string;
  source: string;
  sourceDate: string;
}

/** Per-person-per-night lodge pricing that varies by occupancy and season. */
export interface SeasonalOccupancyPricing {
  pricingModel: 'seasonal_occupancy';
  currency: 'USD';
  lowSeasonDates: string;
  highSeasonDates: string;
  ratesPerPersonPerNight: { occupancy: string; lowSeason: number; highSeason: number }[];
  source: string;
  sourceDate: string;
}

/** A fixed-duration package priced per person, by audience, with a price history. */
export interface PackagePricing {
  pricingModel: 'package_price_by_audience';
  currency: 'USD';
  perPersonPerWholeActivity: { audience: string; price2023: number; price2024: number }[];
  notes?: string;
  source: string;
  sourceDate: string;
}

/** A lookup table of point-to-point fares (bus corridors, intercity routes). */
export interface RouteLookupPricing {
  pricingModel: 'route_lookup';
  currency: 'RWF';
  groups: { groupLabel: string; routes: { from: string; to: string; priceRWF: number }[] }[];
  notes?: string;
  source: string;
  sourceDate: string;
}

/** Hotel room-type rates, with an optional UN per-diem reference rate. */
export interface HotelRoomPricing {
  pricingModel: 'hotel_room_rates';
  currency: 'USD';
  rooms: { roomType: string; ratePerNight: number | null; unRate?: number | null }[];
  priceConfidence: 'verified_current' | 'unverified_historical';
  notes?: string;
  source: string;
  sourceDate: string;
}

// ---------------------------------------------------------------------------
// Entries (filled in below by section)
// ---------------------------------------------------------------------------

export const tourismEntriesBatch3: any[] = [
  // --- VOLCANOES NATIONAL PARK -----------------------------------------
  {
    category: 'permit' as const,
    name: 'Mountain Gorilla Trekking Permit',
    description:
      'Official RDB permit for mountain gorilla trekking in Volcanoes National Park. Includes ' +
      'park entry, ranger guides, one hour with a habituated gorilla family, and a trekking ' +
      'certificate. Minimum age 15 (stricter than the golden monkey permit\'s age-12 minimum). ' +
      'RDB is currently running promotional rates for Rwandan/EAC and other African visitors; ' +
      'international (non-resident) pricing is unchanged.',
    location: 'Volcanoes National Park, Musanze District, Northern Province',
    priceUSD: 1500,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'tiered_by_residency',
      currency: 'mixed',
      tiers: [
        { audience: 'foreigner', adult: 1500, studentOrChild: null, currency: 'USD' },
        { audience: 'foreign_resident_in_rwanda', adult: 500, studentOrChild: 500, currency: 'USD' },
        { audience: 'african_citizen_or_foreign_resident_in_africa', adult: 500, studentOrChild: 500, currency: 'USD' },
        { audience: 'rwandan_citizen', adult: 200, studentOrChild: 200, currency: 'USD' },
        { audience: 'east_african_citizen', adult: 200, studentOrChild: 200, currency: 'USD' },
      ],
      promotionalNote:
        'The 200/500 USD rates for Rwandan/EAC and other African visitors are promotional rates ' +
        'confirmed live on the RDB booking portal and corroborated by a January 2026 RDB news ' +
        'statement extending them through end of 2026 — but the portal text itself still says ' +
        'they don\'t apply June-October (worth re-checking close to travel dates, since that ' +
        'exclusion window looks like it may be left over from an earlier version of the promo). ' +
        'The $1500 foreigner/non-resident rate is NOT promotional and applies year-round.',
      notes:
        'priceUSD ($1500) reflects the foreigner/non-resident adult rate, the rate that applies ' +
        'to the international-traveler persona this app primarily targets. Refund policy: full ' +
        'refund if the gorilla group\'s movement prevents tracking all day; 75% refund if tracked ' +
        'all day without making contact; no refund for late arrival/no-show. Permits are ' +
        'non-transferable and tied to a specific name and passport number.',
      source: 'https://visitrwandabookings.rdb.rw/rdbportal/mountain-gorilla-tracking',
      sourceDate: '2026-06-16',
    } satisfies TieredResidencyPricing,
    tags: ['wildlife', 'adventure', 'permit', 'volcanoes-national-park', 'gorilla-trekking', 'flagship'],
    bookingContact: 'reservation@rwandatourism.com',
    lastVerified: new Date('2026-06-16'),
  },

  // --- AKAGERA NATIONAL PARK --------------------------------------------
  {
    category: 'permit' as const,
    name: 'Akagera National Park Entry Permit',
    description:
      'Self-drive entry permit for Akagera National Park, tiered by residency and by number of ' +
      'nights (1-3). The fee reduces 50% on the 2nd and 3rd night, then is free for any further ' +
      'nights up to one week. Day visitors pay once per day; overnight visitors pay per night ' +
      'inside the park. Vehicle fees and guides are separate (see notes).',
    location: 'Akagera National Park, Eastern Province (gateway town: Kayonza)',
    priceUSD: 100,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'tiered_by_residency_and_nights',
      currency: 'mixed',
      tiers: [
        { audience: 'rwandan_eac_citizen', ageGroup: 'adult', currency: 'USD', ratesByNights: { '1': 16, '2': 24, '3': 32, '4to7': 0 } },
        { audience: 'rwandan_eac_citizen', ageGroup: 'adult', currency: 'RWF', ratesByNights: { '1': 15000, '2': 22500, '3': 30000, '4to7': 0 } },
        { audience: 'rwandan_eac_citizen', ageGroup: 'child_6_to_12', currency: 'USD', ratesByNights: { '1': 11, '2': 16, '3': 21, '4to7': 0 } },
        { audience: 'rwandan_eac_citizen', ageGroup: 'child_6_to_12', currency: 'RWF', ratesByNights: { '1': 10000, '2': 15000, '3': 20000, '4to7': 0 } },
        { audience: 'rwandan_eac_resident', ageGroup: 'adult', currency: 'USD', ratesByNights: { '1': 50, '2': 75, '3': 100, '4to7': 0 } },
        { audience: 'rwandan_eac_resident', ageGroup: 'child_6_to_12', currency: 'USD', ratesByNights: { '1': 30, '2': 45, '3': 60, '4to7': 0 } },
        { audience: 'international_visitor', ageGroup: 'adult', currency: 'USD', ratesByNights: { '1': 100, '2': 150, '3': 200, '4to7': 0 } },
        { audience: 'international_visitor', ageGroup: 'child_6_to_12', currency: 'USD', ratesByNights: { '1': 50, '2': 75, '3': 100, '4to7': 0 } },
        { audience: 'pan_african_out_of_eac', ageGroup: 'adult', currency: 'USD', ratesByNights: { '1': 50, '2': 75, '3': 100, '4to7': 0 } },
        { audience: 'pan_african_out_of_eac', ageGroup: 'child_6_to_12', currency: 'USD', ratesByNights: { '1': 30, '2': 45, '3': 60, '4to7': 0 } },
        { audience: 'pan_african_eac_resident', ageGroup: 'adult', currency: 'USD', ratesByNights: { '1': 25, '2': 38, '3': 50, '4to7': 0 } },
        { audience: 'pan_african_eac_resident', ageGroup: 'child_6_to_12', currency: 'USD', ratesByNights: { '1': 15, '2': 23, '3': 30, '4to7': 0 } },
      ],
      groupDiscount:
        'Groups of 20+ Rwandan Nationals get an automatic 20% off: 12,000 RWF/adult, 8,000 RWF/child ' +
        '(this is a flat group rate, not a 20% reduction applied to the per-night table above).',
      notes:
        'Children 5 and under: free, no entry or activity fees. Vehicle fee (separate from entry): ' +
        'Rwandan/EAC-registered car or minibus $10, omnibus/bus/overlander $20; foreign-registered ' +
        'car or minibus $40, omnibus/bus/overlander $100. Self-drive guide: $25/half day, $40/full day. ' +
        'Residency must be verified with documentation or international rates apply. Annual passes ' +
        'available: Rwandan/EAC citizen single 95,000 RWF / couple 150,000 RWF / family 205,000 RWF; ' +
        'Rwandan/EAC resident single $300 / couple $500 / family $700 (includes entry permits only, ' +
        'not vehicle fees or activities; 10% activity discount for pass holders). priceUSD ($100) is ' +
        'the international-visitor 1-night adult rate.',
      source: 'Akagera Management Company — Pricing for Akagera National Park 2024 (PDF)',
      sourceDate: '2024',
    } satisfies TieredResidencyNightsPricing,
    tags: ['wildlife', 'safari', 'permit', 'akagera-national-park', 'big-five'],
    bookingContact: '+250786182871 / akagera@africanparks.org',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'activity' as const,
    name: 'Akagera National Park Activities & Game Drives',
    description:
      'Bookable activities inside Akagera National Park, on top of the entry permit and vehicle ' +
      'fee: AMC-operated game drives and night drives, boat trips on Lake Ihema, fishing, camping, ' +
      'a behind-the-scenes conservation tour, the Walk the Line fence walk, and community cultural ' +
      'experiences. Children 13+ pay adult rates; rates below are for ages 6-12 where offered.',
    location: 'Akagera National Park, Eastern Province',
    priceUSD: 200,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'activity_price_list',
      currency: 'USD',
      activities: [
        { name: 'Night drive (AMC operated)', unit: 'per person / 2.5 hrs, vehicle+driver+guide, min 2/max 7', adult: 40, child6to12: 25 },
        { name: 'Fishing (own equipment)', unit: 'per person / day', adult: 25, child6to12: 15 },
        { name: 'Boat trip — scheduled morning/day', unit: 'per person / 1 hr, max 11 pax', adult: 35, child6to12: 20 },
        { name: 'Boat trip — scheduled sunset', unit: 'per person / 1 hr, max 11 pax', adult: 45, child6to12: 30 },
        { name: 'Boat trip — private, non-scheduled (max 11 pax)', unit: 'per boat / 1 hr', adult: 200, child6to12: null, notes: 'Flat rate for the boat, not per person.' },
        { name: 'Boat trip — private, non-scheduled (max 20 pax)', unit: 'per boat / 1 hr', adult: 360, child6to12: null },
        { name: 'Camping', unit: 'per person / night', adult: 25, child6to12: 15 },
        { name: 'Camping at Mihindi Campsite', unit: 'per person / night', adult: 50, child6to12: 30 },
        { name: 'Behind the scenes tour', unit: 'per person / min 4 pax / 1.5 hrs', adult: 25, child6to12: 15 },
        { name: 'Behind the scenes tour — group rate', unit: 'per group of 8+ / 1.5 hrs', adult: 180, child6to12: null },
        { name: 'Game drive (AMC operated) — half day', unit: 'vehicle+driver+guide, max 5 hrs, max 7 pax', adult: 200, child6to12: null, notes: 'Per vehicle, south of the park only.' },
        { name: 'Game drive (AMC operated) — full day', unit: 'vehicle+driver+guide, 6:30am-5pm, max 7 pax', adult: 350, child6to12: null },
        { name: 'Walk the Line (7km fence walk)', unit: 'per person / min 3 / approx. 2 hrs', adult: 30, child6to12: 20 },
        { name: 'Community Cultural Experiences', unit: 'per person / half day / min 3 pax', adult: 30, child6to12: 20 },
        { name: 'Tent hire (6-man, south sites)', unit: 'per tent', adult: 30, child6to12: null },
        { name: 'Commercial filming/photography', unit: 'per day, contact park first', adult: 400, child6to12: null },
      ],
      source: 'Akagera Management Company — Pricing for Akagera National Park 2024 (PDF)',
      sourceDate: '2024',
    } satisfies ActivityListPricing,
    tags: ['wildlife', 'safari', 'activity', 'akagera-national-park', 'boat-trip', 'game-drive'],
    bookingContact: '+250786182871 / akagera@africanparks.org',
    lastVerified: new Date('2026-06-16'),
  },

  // --- NYUNGWE NATIONAL PARK --------------------------------------------
  {
    category: 'permit' as const,
    name: 'Nyungwe National Park Entry Permit',
    description:
      'Entry permit for Nyungwe National Park, tiered by residency and by number of nights ' +
      '(1-7+). Like Akagera, the fee reduces 50% on the 2nd/3rd night then is free beyond that ' +
      'for up to a week. This entry fee is separate from chimpanzee trekking and other special ' +
      'activities, which carry their own fees.',
    location: 'Nyungwe National Park, Southern/Western Provinces (Gisovu and Uwinka entrances)',
    priceUSD: 100,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'tiered_by_residency_and_nights',
      currency: 'USD',
      tiers: [
        { audience: 'rwandan_eac_citizen', ageGroup: 'adult', currency: 'USD', ratesByNights: { '1': 10, '2': 15, '3': 20, '4to7': 0 } },
        { audience: 'rwandan_eac_citizen', ageGroup: 'child_6_to_12', currency: 'USD', ratesByNights: { '1': 5, '2': 7.5, '3': 10, '4to7': 0 } },
        { audience: 'foreign_resident_in_rwanda_eac', ageGroup: 'adult', currency: 'USD', ratesByNights: { '1': 60, '2': 90, '3': 120, '4to7': 0 } },
        { audience: 'foreign_resident_in_rwanda_eac', ageGroup: 'child_6_to_12', currency: 'USD', ratesByNights: { '1': 30, '2': 45, '3': 60, '4to7': 0 } },
        { audience: 'african_citizen_other_than_eac', ageGroup: 'adult', currency: 'USD', ratesByNights: { '1': 60, '2': 90, '3': 120, '4to7': 0 } },
        { audience: 'african_citizen_other_than_eac', ageGroup: 'child_6_to_12', currency: 'USD', ratesByNights: { '1': 30, '2': 45, '3': 60, '4to7': 0 } },
        { audience: 'international_visitor', ageGroup: 'adult', currency: 'USD', ratesByNights: { '1': 100, '2': 150, '3': 200, '4to7': 0 } },
        { audience: 'international_visitor', ageGroup: 'child_6_to_12', currency: 'USD', ratesByNights: { '1': 50, '2': 75, '3': 100, '4to7': 0 } },
      ],
      groupDiscount:
        'Groups of 20+ Rwandan Nationals: automatic 20% off; 8,000 RWF/adult, 4,000 RWF/child flat rate.',
      notes:
        'Children 5 and under: free. International adult/child rates are listed as "non-commissionable." ' +
        'Annual passes: Rwandan/EAC citizen single 95,000 RWF / couple 150,000 RWF / family 205,000 RWF ' +
        '(2 adults + 2 children, +20,000 RWF per extra child); foreign resident single $300 / couple $500 ' +
        '/ family $700 (+$50 per extra child); includes entry permits only, 10% discount on activities for ' +
        'pass holders. Cancellation policy: >7 days prior 30%, <7 days prior 50%, after activity commenced ' +
        '100% of total due (the >30-day tier\'s percentage was garbled/cut off in the source PDF — worth ' +
        'getting RDB/park management to confirm that one number directly rather than guessing it). ' +
        'priceUSD ($100) is the international-visitor 1-night adult rate. Cashless park — MTN MoMo, DPO, ' +
        'bank transfer, or Visa/MasterCard only.',
      source: 'Nyungwe Management Company — Activities & Accommodation in Nyungwe National Park 2023-2024 (PDF)',
      sourceDate: '2023-2024',
    } satisfies TieredResidencyNightsPricing,
    tags: ['wildlife', 'forest', 'permit', 'nyungwe-national-park', 'chimpanzee'],
    bookingContact: 'nyungwe@africanparks.org / +250788317027',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'activity' as const,
    name: 'Nyungwe National Park Activities (Chimp Trekking, Canopy Walk, Birding)',
    description:
      'Bookable activities inside Nyungwe on top of the park entry permit: chimpanzee trekking, ' +
      'the Canopy Walkway, guided birding, other primate trekking, and night treks, plus freelance ' +
      'guide and porter fees for regular forest walks. Groups for the canopy/birding/primate/night ' +
      'activities run 2-8 people (a solo visitor pays for 2).',
    location: 'Nyungwe National Park, Southern/Western Provinces',
    priceUSD: 150,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'activity_price_list',
      currency: 'USD',
      activities: [
        { name: 'Chimpanzee trekking (includes guide) — Rwanda/EAC citizen', unit: 'per person', adult: 25, child6to12: null },
        { name: 'Chimpanzee trekking (includes guide) — EAC resident', unit: 'per person', adult: 75, child6to12: null },
        { name: 'Chimpanzee trekking (includes guide) — international visitor', unit: 'per person', adult: 150, child6to12: null },
        { name: 'Canopy Walkway / guided birding / other primate trekking / night trek — Rwandan/EAC citizen', unit: 'per person, includes guiding fee', adult: 5, child6to12: null },
        { name: 'Canopy Walkway / guided birding / other primate trekking / night trek — foreign resident', unit: 'per person, includes guiding fee', adult: 20, child6to12: null },
        { name: 'Canopy Walkway / guided birding / other primate trekking / night trek — international visitor', unit: 'per person, includes guiding fee', adult: 40, child6to12: null },
        { name: 'Freelance guide, regular forest walk', unit: 'per guide / half day', adult: 15, child6to12: null },
        { name: 'Freelance guide, regular forest walk', unit: 'per guide / full day', adult: 25, child6to12: null },
        { name: 'Porter', unit: 'per porter / half day', adult: 5, child6to12: null },
        { name: 'Porter', unit: 'per porter / full day', adult: 10, child6to12: null },
        { name: 'Camping', unit: 'per person / night', adult: 15, child6to12: 7.5 },
        { name: 'Tent hire (4-man, approx. 3m x 3m)', unit: 'per tent / night', adult: 20, child6to12: null },
        { name: 'Commercial filming/photography', unit: 'per day, contact park first', adult: 300, child6to12: null },
      ],
      notes:
        'For multi-day walking trails, an extra 15,000 RWF applies for a guide\'s (and separately, a ' +
        'porter\'s) accommodation/food for up to 3 nights, +5,000 RWF/extra night. One guide is required ' +
        'per 8 tourists. Night walks run 5:30pm-8/9pm.',
      source: 'Nyungwe Management Company — Activities & Accommodation in Nyungwe National Park 2023-2024 (PDF)',
      sourceDate: '2023-2024',
    } satisfies ActivityListPricing,
    tags: ['wildlife', 'forest', 'activity', 'nyungwe-national-park', 'chimpanzee', 'canopy-walk', 'birding'],
    bookingContact: 'nyungwe@africanparks.org / +250788317027',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'accommodation' as const,
    name: 'Gisovu Guest House (Nyungwe National Park)',
    description:
      'Park-run guest house at the Gisovu entrance to Nyungwe National Park, with per-person ' +
      'rates that scale down per head as occupancy increases (single up to sextuple rooms).',
    location: 'Gisovu, Nyungwe National Park, Western Province',
    priceUSD: 96,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'seasonal_occupancy',
      currency: 'USD',
      lowSeasonDates: '1 March - 31 May and 1 October - 14 December',
      highSeasonDates: '1 June - 30 September and 15 December - 28 February',
      ratesPerPersonPerNight: [
        { occupancy: 'single', lowSeason: 96, highSeason: 120 },
        { occupancy: 'double', lowSeason: 115, highSeason: 144 },
        { occupancy: 'triple', lowSeason: 144, highSeason: 180 },
        { occupancy: 'quadruple', lowSeason: 173, highSeason: 216 },
        { occupancy: 'quintuple', lowSeason: 192, highSeason: 240 },
        { occupancy: 'sextuple', lowSeason: 200, highSeason: 252 },
      ],
      source: 'Nyungwe Management Company — Activities & Accommodation in Nyungwe National Park 2023-2024 (PDF)',
      sourceDate: '2023-2024',
    } satisfies SeasonalOccupancyPricing,
    tags: ['accommodation', 'guest-house', 'nyungwe-national-park', 'budget-to-mid-range'],
    bookingContact: 'guests.nyungwe@africanparks.org / +250788317028',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'accommodation' as const,
    name: 'Uwinka Guest House (Nyungwe National Park)',
    description:
      'Park-run guest house at Uwinka, Nyungwe\'s central reception area where most trail and ' +
      'canopy walk activities depart from. Rates are nearly identical to Gisovu; only the ' +
      'quadruple-occupancy low-season rate differs by $2.',
    location: 'Uwinka, Nyungwe National Park, Southern Province',
    priceUSD: 96,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'seasonal_occupancy',
      currency: 'USD',
      lowSeasonDates: '1 March - 31 May and 1 October - 14 December',
      highSeasonDates: '1 June - 30 September and 15 December - 28 February',
      ratesPerPersonPerNight: [
        { occupancy: 'single', lowSeason: 96, highSeason: 120 },
        { occupancy: 'double', lowSeason: 115, highSeason: 144 },
        { occupancy: 'triple', lowSeason: 144, highSeason: 180 },
        { occupancy: 'quadruple', lowSeason: 175, highSeason: 216 },
      ],
      source: 'Nyungwe Management Company — Activities & Accommodation in Nyungwe National Park 2023-2024 (PDF)',
      sourceDate: '2023-2024',
    } satisfies SeasonalOccupancyPricing,
    tags: ['accommodation', 'guest-house', 'nyungwe-national-park', 'budget-to-mid-range'],
    bookingContact: 'guests.nyungwe@africanparks.org / +250788317028',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'activity' as const,
    name: 'Cyinzobe Three-Day Trail (Nyungwe)',
    description:
      'A guided three-day, two-night trail package through Nyungwe with a dedicated guide, ' +
      'departing Uwinka at 1pm, minimum 3 people to run. Most meals are included; park entry ' +
      'fees are billed separately. Priced per person for the whole activity, sharing a ' +
      'twin-bed cottage; a single-occupancy supplement is also published.',
    location: 'Nyungwe National Park (departs from Uwinka)',
    priceUSD: 300,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'package_price_by_audience',
      currency: 'USD',
      perPersonPerWholeActivity: [
        { audience: 'rwandan_eac_citizen_two_sharing', price2023: 160, price2024: 200 },
        { audience: 'rwandan_eac_citizen_single_supplement', price2023: 220, price2024: 280 },
        { audience: 'international_visitor_two_sharing', price2023: 200, price2024: 300 },
        { audience: 'international_visitor_single_supplement', price2023: 280, price2024: 340 },
      ],
      notes:
        'Includes 1 guide. Excludes park entry fees. Meals included: dinner (days 1&2), breakfast ' +
        '(days 2&3), lunch (day 2), tea/coffee (all 3 days) — lunch on day 1 and dinner on day 3 are ' +
        'not covered. Only 2023 and 2024 opening prices are published in the source; no 2025/2026 ' +
        'figure yet, so re-confirm directly with the park before quoting current pricing.',
      source: 'Nyungwe Management Company — Activities & Accommodation in Nyungwe National Park 2023-2024 (PDF)',
      sourceDate: '2023-2024',
    } satisfies PackagePricing,
    tags: ['activity', 'multi-day-trek', 'nyungwe-national-park', 'guided-trail'],
    bookingContact: 'nyungwe@africanparks.org / +250788317027',
    lastVerified: new Date('2026-06-16'),
  },

  // --- TRANSPORT ---------------------------------------------------------
  {
    category: 'transport' as const,
    name: 'Kigali City Bus Network (RURA Corridors A-G)',
    description:
      'Official RURA fixed-fare bus network within Kigali, organized into 7 corridors (A-G) ' +
      'covering roughly 60 routes between named bus parks/terminals. For tourism purposes, the ' +
      'most relevant hub is Down Town / Nyabugogo Bus Park (where intercity buses also depart) ' +
      'and Remera/Kacyiru/Kimironko (hotel and embassy-district area).',
    location: 'Kigali (city-wide)',
    priceUSD: 0,
    priceRWF: 307,
    pricingDetails: {
      pricingModel: 'route_lookup',
      currency: 'RWF',
      groups: [
        { groupLabel: 'Corridor A', routes: [
          { from: 'Remera Bus Park', to: 'Down Town Bus Park (via Sonatube)', priceRWF: 307 },
          { from: 'Kabuga Bus Park', to: 'Nyabugogo Bus Park (via Sonatube)', priceRWF: 741 },
          { from: 'Down Town Bus Park', to: 'Kabeza – Rubirizi Bus Terminal (via Remera)', priceRWF: 484 },
          { from: 'Remera Bus Park', to: 'Nyabugogo Bus Park (via Kacyiru)', priceRWF: 355 },
          { from: 'Remera Bus Park', to: 'Nyanza Bus Park', priceRWF: 256 },
          { from: 'Remera Bus Park', to: 'Gikondo – Bwerankori Bus Terminal', priceRWF: 306 },
          { from: 'Remera Bus Park', to: 'Nyabugogo Bus Park (via Sonatube)', priceRWF: 307 },
          { from: 'Remera Bus Park', to: 'SEZ Bus Terminal', priceRWF: 295 },
          { from: 'Down Town Bus Park', to: 'Kabuga Bus Park (via Sonatube)', priceRWF: 741 },
          { from: 'Remera Bus Park', to: 'Busanza Bus Terminal (via Itunda)', priceRWF: 267 },
        ]},
        { groupLabel: 'Corridor B', routes: [
          { from: 'Down Town Bus Park', to: 'Kanombe – Kibaya Bus Terminal (via Sonatube)', priceRWF: 516 },
          { from: 'Remera Bus Park', to: 'Ndera Bus Terminal (ku Gasima)', priceRWF: 269 },
          { from: 'Remera Bus Park', to: 'Masaka Bus Terminal', priceRWF: 384 },
          { from: 'Remera Bus Park', to: 'Kabuga Bus Park', priceRWF: 420 },
          { from: 'Remera Bus Park', to: 'Busanza Bus Terminal (via Rubirizi)', priceRWF: 227 },
          { from: 'Remera Bus Park', to: 'Kanombe – Kibaya Bus Terminal', priceRWF: 224 },
          { from: 'Remera Bus Park', to: 'Busanza Bus Terminal (via Nyarugunga)', priceRWF: 291 },
          { from: 'Nyabugogo Bus Park', to: 'Kanombe – Kibaya Bus Terminal (via Kacyiru)', priceRWF: 565 },
          { from: 'Remera Bus Park', to: 'Masoro (AUCA) Bus Terminal', priceRWF: 291 },
          { from: 'Remera Bus Park', to: 'Gasogi Bus Terminal', priceRWF: 439 },
        ]},
        { groupLabel: 'Corridor C', routes: [
          { from: 'Nyanza Bus Park', to: 'Down Town Bus Park (via Zion)', priceRWF: 340 },
          { from: 'Nyanza Bus Park', to: 'Down Town Bus Park (via Gatenga)', priceRWF: 390 },
          { from: 'Nyanza Bus Park', to: 'Nyabugogo Bus Park (via Zion)', priceRWF: 422 },
          { from: 'Nyanza Bus Park', to: 'Gahanga Bus Terminal', priceRWF: 278 },
          { from: 'Nyanza Bus Park', to: 'Kacyiru Bus Stop', priceRWF: 364 },
          { from: 'Nyanza Bus Park', to: 'Kimironko Bus Park', priceRWF: 323 },
          { from: 'Nyanza Bus Park', to: 'Nyabugogo Bus Park (via Gatenga)', priceRWF: 422 },
        ]},
        { groupLabel: 'Corridor D', routes: [
          { from: 'Down Town Bus Park', to: 'Saint Joseph Bus Terminal', priceRWF: 403 },
          { from: 'Down Town Bus Park', to: 'Gikondo – Bwerankori Bus Terminal', priceRWF: 377 },
          { from: 'Nyabugogo Bus Park', to: 'Gikondo – Bwerankori Bus Terminal', priceRWF: 382 },
          { from: 'Nyabugogo Bus Park', to: 'Saint Joseph Bus Terminal', priceRWF: 383 },
          { from: 'Kimironko Bus Park', to: 'Gikondo – Bwerankori Bus Terminal', priceRWF: 408 },
          { from: 'Muyange Bus Terminal', to: 'Zinia Mkt Bus Terminal', priceRWF: 278 },
        ]},
        { groupLabel: 'Corridor E', routes: [
          { from: 'Down Town Bus Park', to: 'Kinyinya Bus Terminal (via Nyarutarama)', priceRWF: 403 },
          { from: 'Kimironko Bus Park', to: 'Down Town Bus Park', priceRWF: 355 },
          { from: 'Down Town Bus Park', to: 'Kacyiru Bus Terminal', priceRWF: 371 },
          { from: 'Kimironko Bus Park', to: 'Masizi – Birembo Bus Terminal', priceRWF: 301 },
          { from: 'Kimironko Bus Park', to: 'Kinyinya Bus Terminal', priceRWF: 301 },
          { from: 'Kimironko Bus Park', to: 'Musave Bus Terminal (via Zindiro)', priceRWF: 204 },
          { from: 'Kimironko Bus Park', to: 'Batsinda Bus Terminal', priceRWF: 301 },
          { from: 'Kimironko Bus Park', to: 'Masaka Bus Terminal', priceRWF: 355 },
          { from: 'Kabuga Bus Park', to: 'Kimironko Bus Park', priceRWF: 420 },
        ]},
        { groupLabel: 'Corridor F', routes: [
          { from: 'Down Town Bus Park', to: 'Batsinda Bus Terminal (via Agakiriro)', priceRWF: 301 },
          { from: 'Nyabugogo Bus Park', to: 'Kimironko Bus Park (via Kacyiru)', priceRWF: 371 },
          { from: 'Down Town Bus Park', to: 'Musave Bus Terminal (via Zindiro)', priceRWF: 484 },
          { from: 'Nyabugogo Bus Park', to: 'Batsinda Bus Terminal (via Agakiriro)', priceRWF: 301 },
          { from: 'Nyabugogo Bus Park', to: 'Batsinda Bus Terminal (via ULK)', priceRWF: 301 },
          { from: 'Down Town Bus Park', to: 'Batsinda Bus Terminal', priceRWF: 301 },
          { from: 'Nyabugogo Bus Park', to: 'Kimironko Bus Park (via Kibagabaga)', priceRWF: 339 },
          { from: 'Nyabugogo Bus Park', to: 'Kinyinya Bus Terminal (via Utexrwa)', priceRWF: 387 },
          { from: 'Down Town Bus Park', to: 'Kinyinya Bus Terminal (via Utexrwa)', priceRWF: 342 },
          { from: 'Nyabugogo Bus Park', to: 'Gasanze Bus Terminal (via Batsinda)', priceRWF: 462 },
        ]},
        { groupLabel: 'Corridor G', routes: [
          { from: 'Down Town Bus Park', to: 'Nyamirambo Bus Terminal (Ryanyuma)', priceRWF: 243 },
          { from: 'Down Town Bus Park', to: 'Nyamirambo Bus Terminal (Ryanyuma, via Kimisagara)', priceRWF: 307 },
          { from: 'Down Town Bus Park', to: 'Nyacyonga Bus Terminal', priceRWF: 420 },
          { from: 'Nyabugogo Bus Park', to: 'Bishenyi Bus Terminal', priceRWF: 383 },
          { from: 'Nyabugogo Bus Terminal', to: 'Kanyinya Bus Terminal', priceRWF: 484 },
          { from: 'Mageragere Bus Terminal', to: 'ERP Nyamirambo Bus Terminal', priceRWF: 377 },
          { from: 'Nyabugogo Bus Park', to: 'Nyacyonga Bus Terminal', priceRWF: 306 },
          { from: 'Nyabugogo Bus Park', to: 'Karama Bus Terminal', priceRWF: 310 },
          { from: 'Nyabugogo Bus Park', to: 'Down Town Bus Park', priceRWF: 205 },
          { from: 'Nyabugogo Bus Park', to: 'Gihara Bus Terminal', priceRWF: 383 },
          { from: 'Nyamirambo Bus Terminal (Ryanyuma)', to: 'Karama Bus Terminal', priceRWF: 205 },
          { from: 'Nyabugogo Bus Park', to: 'Bweramvura Bus Terminal', priceRWF: 278 },
          { from: 'Nyabugogo Bus Park', to: 'Cyumbati Bus Terminal', priceRWF: 307 },
        ]},
      ],
      notes:
        'priceRWF (307) is shown as a representative single-fare example, not an average — fares ' +
        'range roughly 204-741 RWF depending on route. "Down Town" and "Nyabugogo" bus parks are ' +
        'effectively the same central hub used as the reference point for most routes.',
      source: 'RURA — City of Kigali Public Transport Tariff, effective 16 March 2024 (PDF)',
      sourceDate: '2024-03-16',
    } satisfies RouteLookupPricing,
    tags: ['transport', 'kigali', 'public-bus', 'intra-city'],
    bookingContact: 'info@rura.rw / Toll Free 3988 or 2222',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'transport' as const,
    name: 'Intercity Bus Fares — Key Tourist Routes from Kigali (RURA 2026)',
    description:
      'Curated subset of the official RURA intercity tariff (effective 6 April 2026), covering ' +
      'only the Kigali-to-destination routes most relevant to a tourist itinerary. The full ' +
      'tariff sheet has 605 routes covering every district pairing in the country; the other ' +
      '~590 are mostly rural district-to-district connections with little tourism relevance, so ' +
      'they were left out of the dataset rather than seeded wholesale — refer to the source PDF ' +
      'directly if a specific rural route is ever needed.',
    location: 'Nationwide, departing from Nyabugogo Bus Park, Kigali',
    priceUSD: 0,
    priceRWF: 3821,
    pricingDetails: {
      pricingModel: 'route_lookup',
      currency: 'RWF',
      groups: [
        { groupLabel: 'Kigali (Nyabugogo) to major destinations', routes: [
          { from: 'Nyabugogo', to: 'Musanze (Volcanoes NP gateway)', priceRWF: 3821 },
          { from: 'Nyabugogo', to: 'Rubavu (Lake Kivu / Gisenyi)', priceRWF: 4839 },
          { from: 'Nyabugogo', to: 'Karongi (Lake Kivu / Kibuye)', priceRWF: 4064 },
          { from: 'Nyabugogo', to: 'Huye (Ethnographic Museum / Butare)', priceRWF: 3742 },
          { from: 'Nyabugogo', to: 'Nyamagabe', priceRWF: 4912 },
          { from: 'Nyabugogo', to: 'Kitabi (Nyungwe south entrance)', priceRWF: 5584 },
          { from: 'Nyabugogo', to: 'Kamembe via Huye (Nyungwe west / Rusizi)', priceRWF: 8450 },
          { from: 'Nyabugogo', to: 'Kamembe via Karongi', priceRWF: 7602 },
          { from: 'Nyabugogo', to: "Nyanza (Kings' Palace Museum)", priceRWF: 2705 },
          { from: 'Nyabugogo', to: 'Kayonza (Akagera NP gateway)', priceRWF: 3129 },
          { from: 'Nyabugogo', to: 'Nyagatare via Kayonza', priceRWF: 6712 },
          { from: 'Nyabugogo', to: 'Rwamagana', priceRWF: 2495 },
          { from: 'Nyabugogo', to: 'Muhanga (Gitarama)', priceRWF: 1506 },
          { from: 'Nyabugogo', to: 'Ngororero', priceRWF: 3245 },
          { from: 'Nyabugogo', to: 'Gicumbi', priceRWF: 2297 },
        ]},
      ],
      notes:
        'This replaces the March 2024 intercity tariff with the more current April 2026 figures — ' +
        'fares rose noticeably for most routes between the two versions (e.g. Nyabugogo-Musanze ' +
        'went from 2,821 RWF in 2024 to 3,821 RWF in 2026), so don\'t mix the two vintages in the ' +
        'same calculation.',
      source: 'RURA — Intercity Public Transport Tariff, effective 6 April 2026 (PDF)',
      sourceDate: '2026-04-06',
    } satisfies RouteLookupPricing,
    tags: ['transport', 'intercity', 'bus', 'rwanda-wide'],
    bookingContact: 'info@rura.rw / Toll Free 3988 or 2222',
    lastVerified: new Date('2026-06-16'),
  },

  // --- KIGALI HOTELS -------------------------------------------------------
  // NOTE ON ALL HOTEL ENTRIES BELOW: room rates come from an undated "List of
  // Hotels - Kigali" PDF. Its format (a "UN Rate" column, this exact set of
  // hotels, these price levels) strongly suggests it predates 2015 — Kigali's
  // hotel market has changed a lot since then. Treat every price below as a
  // historical placeholder, NOT a current quote; priceConfidence is set to
  // 'unverified_historical' on every entry so the admin panel/UI can flag it.
  // Hotel name, category, and location are far more durable than the prices.
  // Cross-checked against RDB's 2022 List of Graded Hotels where possible —
  // that confirms a hotel is still officially graded/operating, but carries
  // no pricing of its own.
  {
    category: 'accommodation' as const,
    name: 'Kigali Serena Hotel',
    description:
      'Upper-range international hotel in Nyarugenge, 15 minutes from Kanombe International ' +
      'Airport. Facilities include a swimming pool, fitness center, and international dining. ' +
      'Room rates below are from an undated historical source — verify current rates directly ' +
      'before quoting.',
    location: 'Nyarugenge, Kigali',
    priceUSD: 300,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'hotel_room_rates',
      currency: 'USD',
      rooms: [
        { roomType: 'Deluxe room (60 rooms)', ratePerNight: 300, unRate: 196 },
        { roomType: 'Superior room (19 rooms)', ratePerNight: 325, unRate: 219 },
        { roomType: 'Studio suite (18 rooms)', ratePerNight: 385, unRate: 231 },
        { roomType: 'Executive suite (6 rooms)', ratePerNight: 506, unRate: 312 },
        { roomType: 'Presidential suite (1 room)', ratePerNight: 2400, unRate: null },
      ],
      priceConfidence: 'unverified_historical',
      notes: 'UN Rate column suggests this list was originally compiled for UN per-diem purposes; not redated since.',
      source: '"List of Hotels - Kigali" (undated PDF)',
      sourceDate: 'unknown',
    } satisfies HotelRoomPricing,
    tags: ['accommodation', 'hotel', 'kigali', 'luxury', 'international-chain'],
    bookingContact: 'kigalireservations@serena.co.rw',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'accommodation' as const,
    name: 'Hotel des Mille Collines',
    description:
      'Historic upper-range hotel in central Kigali, internationally known for sheltering ' +
      'refugees during the 1994 genocide (the basis for the film Hotel Rwanda). Facilities ' +
      'include a swimming pool, fitness center, and tennis court. Room rates below are from an ' +
      'undated historical source — verify current rates directly before quoting.',
    location: 'Kigali city center, 13 minutes from Kanombe International Airport',
    priceUSD: 115,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'hotel_room_rates',
      currency: 'USD',
      rooms: [
        { roomType: 'Senior suite (3 rooms)', ratePerNight: 388, unRate: 155 },
        { roomType: 'Junior suite (4 rooms)', ratePerNight: 201, unRate: 141 },
        { roomType: 'Standard, pool view (48 rooms)', ratePerNight: 115, unRate: 95 },
        { roomType: 'Standard, city view (50 rooms)', ratePerNight: 115, unRate: 95 },
      ],
      priceConfidence: 'unverified_historical',
      source: '"List of Hotels - Kigali" (undated PDF)',
      sourceDate: 'unknown',
    } satisfies HotelRoomPricing,
    tags: ['accommodation', 'hotel', 'kigali', 'luxury', 'historic'],
    bookingContact: 'info@millecollines.net',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'accommodation' as const,
    name: 'Laico Hotel Umubano',
    description:
      'Upper-range hotel in Kacyiru with restaurant, swimming pool, tennis court, and mini-golf. ' +
      'Room rates below are from an undated historical source — verify current rates directly ' +
      'before quoting.',
    location: 'Kacyiru, Kigali',
    priceUSD: 180,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'hotel_room_rates',
      currency: 'USD',
      rooms: [
        { roomType: 'Standard room (87 rooms)', ratePerNight: 180, unRate: 140 },
        { roomType: 'Twin room', ratePerNight: 215, unRate: 155 },
        { roomType: 'Junior suite', ratePerNight: 220, unRate: null },
        { roomType: 'Presidential/executive suite', ratePerNight: 250, unRate: null },
      ],
      priceConfidence: 'unverified_historical',
      notes: 'Source listed an identical UN rate of 220 for the junior suite, which may be a transcription artifact rather than a real figure — treat that one cell with extra caution.',
      source: '"List of Hotels - Kigali" (undated PDF)',
      sourceDate: 'unknown',
    } satisfies HotelRoomPricing,
    tags: ['accommodation', 'hotel', 'kigali', 'upper-range'],
    bookingContact: 'reservations.umubano@laicohotels.com',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'accommodation' as const,
    name: 'Chez Lando Hotel',
    description:
      'Mid-range hotel in Remera with bar/restaurant and DDP (dinner, bed & breakfast) option. ' +
      'Confirmed as a currently RDB-graded 3-star Town Hotel as of 2022, which gives more ' +
      'confidence this hotel is still operating than for entries without that cross-check — but ' +
      'the room rates below are still from an undated historical source.',
    location: 'Remera, Kigali',
    priceUSD: 60,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'hotel_room_rates',
      currency: 'USD',
      rooms: [
        { roomType: 'Standard room (22 rooms)', ratePerNight: 60, unRate: 57 },
        { roomType: 'Bungalow room (40 rooms)', ratePerNight: 100, unRate: 95 },
        { roomType: 'Pavilion room (20 rooms)', ratePerNight: 90, unRate: 87 },
      ],
      priceConfidence: 'unverified_historical',
      notes: 'Cross-checked against RDB List of Graded Hotels 2022: confirmed 3-star Town Hotel, Kigali.',
      source: '"List of Hotels - Kigali" (undated PDF); grading cross-checked against RDB List of Graded Hotels 2022',
      sourceDate: 'unknown (rates); 2022 (grading)',
    } satisfies HotelRoomPricing,
    tags: ['accommodation', 'hotel', 'kigali', 'mid-range', 'rdb-graded'],
    bookingContact: 'lando@rwanda1.com',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'accommodation' as const,
    name: 'Hotel Isimbi',
    description:
      'Budget hotel in central Kigali. Confirmed as a currently RDB-graded 3-star Town Hotel as ' +
      'of 2022. Room rates below are from an undated historical source and look low even for a ' +
      'budget property by today\'s standards — treat as a rough floor, not a current quote.',
    location: 'Kigali city center',
    priceUSD: 30,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'hotel_room_rates',
      currency: 'USD',
      rooms: [
        { roomType: 'Single (20 rooms)', ratePerNight: 30, unRate: null },
        { roomType: 'Double (3 rooms)', ratePerNight: 35, unRate: null },
      ],
      priceConfidence: 'unverified_historical',
      notes: 'Cross-checked against RDB List of Graded Hotels 2022: confirmed 3-star Town Hotel, Kigali.',
      source: '"List of Hotels - Kigali" (undated PDF); grading cross-checked against RDB List of Graded Hotels 2022',
      sourceDate: 'unknown (rates); 2022 (grading)',
    } satisfies HotelRoomPricing,
    tags: ['accommodation', 'hotel', 'kigali', 'budget', 'rdb-graded'],
    bookingContact: 'isimbi@Hotmail.com',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'accommodation' as const,
    name: 'Gorilla Hotel',
    description:
      'Mid-range hotel in the Kiyovu residential suburb with international restaurant/bar and ' +
      'business facilities. Room rates below are from an undated historical source — verify ' +
      'current rates directly before quoting.',
    location: 'Kiyovu, Kigali',
    priceUSD: 110,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'hotel_room_rates',
      currency: 'USD',
      rooms: [
        { roomType: 'Single, one double bed (22 rooms)', ratePerNight: 110, unRate: null },
        { roomType: 'Twin beds (9 rooms)', ratePerNight: 140, unRate: null },
      ],
      priceConfidence: 'unverified_historical',
      source: '"List of Hotels - Kigali" (undated PDF)',
      sourceDate: 'unknown',
    } satisfies HotelRoomPricing,
    tags: ['accommodation', 'hotel', 'kigali', 'mid-range'],
    bookingContact: 'gorillasHotel@rwanda1.com',
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'accommodation' as const,
    name: 'Centre Isano',
    description:
      'Lower-range guest house in Gikondo/Mburabuturo, 10 minutes from Kigali Serena Hotel. ' +
      'Room rates below are from an undated historical source and are very low even for budget ' +
      'lodging — treat as a rough floor, not a current quote.',
    location: 'Gikondo/Mburabuturo, Kigali',
    priceUSD: 15,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'hotel_room_rates',
      currency: 'USD',
      rooms: [
        { roomType: 'Double (9 rooms)', ratePerNight: 15, unRate: null },
        { roomType: 'Apartment, 2 rooms', ratePerNight: 42, unRate: null },
      ],
      priceConfidence: 'unverified_historical',
      notes: 'Breakfast listed at an additional 4 USD/person in the source.',
      source: '"List of Hotels - Kigali" (undated PDF)',
      sourceDate: 'unknown',
    } satisfies HotelRoomPricing,
    tags: ['accommodation', 'guest-house', 'kigali', 'budget'],
    bookingContact: 'epr@rwandatel1.com',
    lastVerified: new Date('2026-06-16'),
  },

  // --- LAKE KIVU / RUBAVU --------------------------------------------------
  // None of these have a published fee in the source (a descriptive tourist
  // map, not a tariff sheet) — priceUSD/RWF are left at 0 with a note rather
  // than guessed, since cost is usually operator- or activity-dependent here.
  {
    category: 'attraction' as const,
    name: 'Congo Nile Trail',
    description:
      'A 227km scenic trail running along the Lake Kivu shoreline through Rutsiro, Karongi, and ' +
      'Rusizi districts in Western Province. Can be done on foot (around 5 days) or by 4x4 ' +
      '(around 3 days), passing tea and coffee estates and Western Rift Valley mountain scenery ' +
      'along the way.',
    location: 'Lake Kivu shoreline, Western Province (Rubavu to Rusizi)',
    priceUSD: 0,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'activity_price_list',
      currency: 'USD',
      activities: [],
      notes: 'No fee schedule published in the source map. Cost is operator/guide-dependent for the multi-day version; check with a registered tour operator or RDB for current trail fees and guide rates.',
      source: 'Rubavu Destination Tourist Map (RDB / Africa on Paper, PDF)',
      sourceDate: 'undated',
    } satisfies ActivityListPricing,
    tags: ['attraction', 'lake-kivu', 'hiking', 'multi-day-trek', 'rubavu'],
    bookingContact: null,
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'attraction' as const,
    name: 'Nyamyumba Hot Springs',
    description:
      'Natural hot springs about 7km from Gisenyi town center on the way to Kigufi, thought to ' +
      'have medicinal and curative properties. A popular spot to unwind and take a swim.',
    location: 'Nyamyumba Sector, Rubavu District, near Gisenyi',
    priceUSD: 0,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'activity_price_list',
      currency: 'RWF',
      activities: [],
      notes: 'No fee schedule published in the source map.',
      source: 'Rubavu Destination Tourist Map (RDB / Africa on Paper, PDF)',
      sourceDate: 'undated',
    } satisfies ActivityListPricing,
    tags: ['attraction', 'lake-kivu', 'hot-springs', 'rubavu', 'relaxation'],
    bookingContact: null,
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'attraction' as const,
    name: 'Gisenyi Beach',
    description:
      'Sometimes called "the St Tropez of Africa," a tropical beach lined with palm trees along ' +
      'Lake Kivu, with several hotels and community campsites nearby. Good for swimming, boat ' +
      'rides, and other water sports.',
    location: 'Gisenyi, Rubavu District',
    priceUSD: 0,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'activity_price_list',
      currency: 'RWF',
      activities: [],
      notes: 'Public beach access; no fee schedule published in the source map. Specific hotel beach clubs may charge their own day-use fees.',
      source: 'Rubavu Destination Tourist Map (RDB / Africa on Paper, PDF)',
      sourceDate: 'undated',
    } satisfies ActivityListPricing,
    tags: ['attraction', 'lake-kivu', 'beach', 'rubavu', 'water-sports'],
    bookingContact: null,
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'activity' as const,
    name: 'Ingoboka Coffee Cooperative Tour',
    description:
      '"From crop to cup" coffee tour on volcanic soils at 1,450-1,800m altitude, where the ' +
      'Bourbon beans used in Rwanda\'s coffee exports (including supply to Starbucks) are grown. ' +
      'See the hand-raising and care of coffee plants and visit the nearby Gashishi Washing ' +
      'Station where the coffee is processed.',
    location: 'Near Gisenyi, Rubavu District',
    priceUSD: 0,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'activity_price_list',
      currency: 'USD',
      activities: [],
      notes: 'No fee schedule published in the source map; coffee cooperative tours are typically booked through a local operator or directly with the cooperative.',
      source: 'Rubavu Destination Tourist Map (RDB / Africa on Paper, PDF)',
      sourceDate: 'undated',
    } satisfies ActivityListPricing,
    tags: ['activity', 'lake-kivu', 'coffee-tour', 'rubavu', 'agritourism'],
    bookingContact: null,
    lastVerified: new Date('2026-06-16'),
  },
  {
    category: 'activity' as const,
    name: 'The Dancing Pots (Batwa Pottery Project)',
    description:
      'A pottery project run by the indigenous Batwa community (about 33,000 remain in Rwanda, ' +
      '0.4% of the population), known as the first Fair Trade pottery business in the country. ' +
      'The Batwa are particularly renowned as potters, dancers, and musicians; the project offers ' +
      'visitors a chance to learn about and interact directly with the community.',
    location: 'Rubavu District, near Gisenyi',
    priceUSD: 0,
    priceRWF: 0,
    pricingDetails: {
      pricingModel: 'activity_price_list',
      currency: 'RWF',
      activities: [],
      notes: 'No fee schedule published in the source map; contact the project or a local operator directly to arrange a visit.',
      source: 'Rubavu Destination Tourist Map (RDB / Africa on Paper, PDF)',
      sourceDate: 'undated',
    } satisfies ActivityListPricing,
    tags: ['activity', 'culture', 'community-tourism', 'rubavu', 'batwa', 'pottery'],
    bookingContact: null,
    lastVerified: new Date('2026-06-16'),
  },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

export async function seedBatch3() {
  const inserted = await database.insert(tourismEntries).values(tourismEntriesBatch3).returning();
  console.log(`Inserted ${inserted.length} tourism entries (batch 3).`);
  return inserted;
}
