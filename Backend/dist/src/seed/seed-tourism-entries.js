"use strict";
/**
 * Via Travels — Tourism dataset seed, batch 2
 * -----------------------------------------------------------------------
 * Every entry below is built ONLY from sources directly confirmed in chat
 * (official RDB / RCHA / RURA pages or PDFs) — nothing here is estimated.
 * Where a source screenshot was partial or unclear, that's noted instead
 * of guessing a number.
 *
 * Sources used in this batch:
 *  - RDB / Visit Rwanda booking portal — golden monkey permit pricing
 *      https://visitrwandabookings.rdb.rw/rdbportal/golden-monkeys
 *  - RCHA (Rwanda Cultural Heritage Academy) — national museums fee sheet
 *      https://rwandaheritage.gov.rw/en/visit-national-museums
 *  - RURA — Tariff for Motorcycle Transportation Services (moto-taxi)
 *
 * Run this against the existing Drizzle setup, e.g.:
 *   import { seedBatch2 } from './seed-tourism-entries';
 *   seedBatch2().then(() => process.exit(0));
 *
 * Requires the 0001_add_pricing_details.sql migration to be applied first.
 */
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
exports.tourismEntriesBatch2 = void 0;
exports.seedBatch2 = seedBatch2;
const database_1 = require("../utils/config/database");
const schema_1 = require("../utils/config/schema");
// ---------------------------------------------------------------------------
// Reusable RCHA entrance-fee block — identical across all 6 national museums
// ---------------------------------------------------------------------------
const RCHA_SOURCE = 'https://rwandaheritage.gov.rw/en/visit-national-museums';
const RCHA_DATE = '2026-06-16';
const RCHA_BOOKING_URL = 'https://irembo.gov.rw/user/citizen/service/rcha/visit_schedule_for_national_museums_of_rwanda';
function rchaEntranceFee(specialExhibitions) {
    return {
        pricingModel: 'tiered_by_residency',
        currency: 'RWF',
        tiers: [
            { audience: 'national', adult: 2000, childOrStudent: 1000, currency: 'RWF' },
            { audience: 'eac_cepgl_citizen', adult: 4000, childOrStudent: 2000, currency: 'RWF' },
            { audience: 'international_resident_in_rwanda', adult: 2000, childOrStudent: 1000, currency: 'RWF' },
            { audience: 'international_non_resident', adult: 10000, childOrStudent: 4000, currency: 'RWF' },
        ],
        groupRates: {
            note: 'Group of 20 students/children, per person',
            national: 500,
            eac_cepgl_citizen: 1000,
            international_resident_in_rwanda: 500,
            international_non_resident: 2000,
        },
        addOns: specialExhibitions,
        notes: 'Single ticket valid 3 hours. Combined ticket (2+ museums) valid 3 months — ' +
            '20% off for 2 museums, 25% off for 3-7 museums, 30% off for all museums. ' +
            'Open daily 9:00am-5:00pm; opens at 12:00pm on Umuganda Saturdays (last Saturday ' +
            'of the month); closed April 7 (Genocide commemoration), Dec 25, and Jan 1.',
        source: RCHA_SOURCE,
        sourceDate: RCHA_DATE,
    };
}
// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------
exports.tourismEntriesBatch2 = [
    // 1. Golden monkey trekking permit ----------------------------------------
    {
        category: 'permit',
        name: 'Golden Monkey Trekking Permit',
        description: 'Official RDB permit required to trek golden monkeys in Volcanoes National Park. ' +
            'Minimum age 12. RDB explicitly warns that erroneous or incomplete applications will ' +
            'be denied park entry even after a permit has been paid for and issued.',
        location: 'Volcanoes National Park, Musanze District, Northern Province',
        priceUSD: 100,
        priceRWF: 0,
        pricingDetails: {
            pricingModel: 'tiered_by_residency',
            currency: 'mixed',
            tiers: [
                { audience: 'foreigner', adult: 100, childOrStudent: null, currency: 'USD' },
                { audience: 'foreign_resident_in_rwanda', adult: 65, childOrStudent: 45, currency: 'USD' },
                { audience: 'east_african_citizen', adult: 65, childOrStudent: 45, currency: 'USD' },
                { audience: 'east_african_foreign_resident', adult: 80, childOrStudent: 45, currency: 'USD' },
                { audience: 'rwandan_citizen', adult: 4000, childOrStudent: 2000, currency: 'RWF' },
            ],
            notes: 'No published child/student rate for the "foreigner" tier (minimum trekking age is 12 ' +
                'regardless). priceUSD ($100) reflects the foreigner adult rate. priceRWF is left at 0 ' +
                'on purpose — the Rwandan-citizen RWF figures are a separate tier, not a currency ' +
                'conversion of the $100 figure, and treating them as equivalent would misrepresent both.',
            source: 'https://visitrwandabookings.rdb.rw/rdbportal/golden-monkeys',
            sourceDate: '2026-06-16',
        },
        tags: ['wildlife', 'adventure', 'permit', 'volcanoes-national-park', 'golden-monkey'],
        bookingContact: 'reservation@rwandatourism.com',
        lastVerified: new Date('2026-06-16'),
    },
    // 2. Kings' Palace Museum — Nyanza -----------------------------------------
    {
        category: 'attraction',
        name: "Kings' Palace Museum",
        description: 'Reconstructed royal residence and cattle kraal in Nyanza, former capital of the ' +
            'Rwandan monarchy. Optional add-on: the Inyambo Parade, a ceremonial showcase of the ' +
            "royal long-horned Inyambo cattle, performed in traditional dress.",
        location: 'Nyanza District, Southern Province',
        priceUSD: 0,
        priceRWF: 10000,
        pricingDetails: rchaEntranceFee({
            inyamboParade: {
                description: 'Ceremonial Inyambo cattle parade, booked separately from base entry',
                adult: 3000,
                childOrStudent: 1000,
                groupOfStudents20Each: 500,
                currency: 'RWF',
            },
        }),
        tags: ['culture', 'history', 'museum', 'nyanza', 'royal-heritage'],
        bookingContact: RCHA_BOOKING_URL,
        lastVerified: new Date('2026-06-16'),
    },
    // 3. Kandt House Museum -----------------------------------------------------
    {
        category: 'attraction',
        name: 'Kandt House Museum',
        description: 'Former residence of Richard Kandt, the first European colonial administrator of ' +
            "Rwanda. Houses a natural history exhibit and Rwanda's official reptile/snake exhibition.",
        location: 'Kigali',
        priceUSD: 0,
        priceRWF: 10000,
        pricingDetails: rchaEntranceFee({
            reptileExhibition: {
                description: 'Reptiles exhibition, booked separately from base entry',
                adult: 2000,
                childOrStudent: 1000,
                groupOfStudents20Each: 500,
                currency: 'RWF',
            },
        }),
        tags: ['culture', 'history', 'museum', 'kigali', 'natural-history'],
        bookingContact: RCHA_BOOKING_URL,
        lastVerified: new Date('2026-06-16'),
    },
    // 4. Rwanda Art Museum (Kigali) ----------------------------------------------
    {
        category: 'attraction',
        name: 'Rwanda Art Museum',
        description: 'Former presidential palace in Kigali, now a contemporary and traditional art museum. ' +
            "Two optional add-ons: a visit to the airplane remains on the grounds (linked to the " +
            "1994 plane crash), and a visit to the former RPA high command's bunker.",
        location: 'Kigali',
        priceUSD: 0,
        priceRWF: 10000,
        pricingDetails: rchaEntranceFee({
            airplaneRemainsVisit: {
                adult: 2000,
                childOrStudent: 1000,
                groupOfStudents20Each: 500,
                currency: 'RWF',
            },
            rpaBunkerVisit: {
                adult: 5000,
                childOrStudent: 1000,
                groupOfStudents20Each: null, // not visible in source screenshot — confirm before using
                currency: 'RWF',
                note: 'Group rate was cut off in the source screenshot — confirm with RCHA before publishing.',
            },
        }),
        tags: ['culture', 'art', 'museum', 'kigali', 'history'],
        bookingContact: RCHA_BOOKING_URL,
        lastVerified: new Date('2026-06-16'),
    },
    // 5. Rwanda Liberation Museum -------------------------------------------------
    {
        category: 'attraction',
        name: 'Rwanda Liberation Museum',
        description: 'National museum dedicated to the RPA/RPF liberation struggle. Exact site location ' +
            'was not stated on the RCHA fee sheet — confirm before publishing in the app.',
        location: 'Not stated in source — confirm with RCHA',
        priceUSD: 0,
        priceRWF: 10000,
        pricingDetails: rchaEntranceFee({
            specialExhibitionNote: {
                childOrStudent: 1000,
                groupOfStudents20Each: 500,
                groupOfAdults20Each: 2500,
                adultSingleVisitor: null,
                note: 'Standard single-adult special-exhibition rate was cut off the top of the source ' +
                    'screenshot — only the child/student and group rates were visible. Confirm before use.',
                currency: 'RWF',
            },
        }),
        tags: ['culture', 'history', 'museum', 'liberation-history'],
        bookingContact: RCHA_BOOKING_URL,
        lastVerified: new Date('2026-06-16'),
    },
    // 6. Ethnographic Museum (Huye) -----------------------------------------------
    {
        category: 'attraction',
        name: 'Ethnographic Museum',
        description: "Rwanda's main national ethnographic museum, covering traditional culture and daily " +
            'life. Offers hands-on craft sessions (beading, weaving, ceramics, postcard-making) ' +
            'as an optional add-on to the base entry.',
        location: 'Huye District, Southern Province',
        priceUSD: 0,
        priceRWF: 10000,
        pricingDetails: rchaEntranceFee({
            handsOnCraftSession: {
                description: 'Beading, weaving, ceramics, postcards — TTC-style hands-on session',
                individualPerDay: 1000,
                individualPerMonth: 50000,
                organizedGroupPerDay: 150000,
                currency: 'RWF',
            },
        }),
        tags: ['culture', 'museum', 'huye', 'crafts', 'hands-on'],
        bookingContact: RCHA_BOOKING_URL,
        lastVerified: new Date('2026-06-16'),
    },
    // 7. Museum for Campaign Against Genocide (Kigali) ----------------------------
    {
        category: 'attraction',
        name: 'Museum for Campaign Against Genocide',
        description: "Kigali museum (Camp Kigali area) documenting the RPA's campaign to stop the 1994 " +
            'genocide — distinct from the Kigali Genocide Memorial at Gisozi, which is run by ' +
            'CNLG/Aegis Trust and is not covered by this RCHA fee sheet.',
        location: 'Kigali',
        priceUSD: 0,
        priceRWF: 10000,
        pricingDetails: rchaEntranceFee({
            outdoorExhibitionAdmission: {
                adult: 3000,
                childOrStudent: 1000,
                group20to100Total: 10000,
                groupOver100Total: 50000,
                currency: 'RWF',
            },
            guidingServiceFee: {
                individualVisitor1to19: { adult: 5000, childOrStudent: 2000 },
                group20Plus: { adultEach: 1000, childOrStudentEach: 500 },
                currency: 'RWF',
            },
        }),
        tags: ['culture', 'history', 'museum', 'kigali', 'genocide-history'],
        bookingContact: RCHA_BOOKING_URL,
        lastVerified: new Date('2026-06-16'),
    },
    // 8. Moto-taxi (Kigali) ---------------------------------------------------
    {
        category: 'transport',
        name: 'Moto-Taxi (Motorcycle Taxi) — Kigali',
        description: 'RURA-regulated moto-taxi fare formula for trips within Kigali. This is a distance-based ' +
            'formula, not a flat per-ride price — priceRWF below is just the flat-fare minimum.',
        location: 'Kigali (city-wide)',
        priceUSD: 0,
        priceRWF: 300,
        pricingDetails: {
            pricingModel: 'distance_formula',
            currency: 'RWF',
            baseFare: { upToKm: 2, amount: 300 },
            perAdditionalKm: 133,
            waiting: { freeMinutes: 10, perMinuteAfter: 21 },
            source: 'RURA — Tariff for Motorcycle Transportation Services',
            sourceDate: '2024',
        },
        tags: ['transport', 'kigali', 'moto-taxi', 'intra-city'],
        bookingContact: null,
        lastVerified: new Date('2026-06-16'),
    },
];
// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
function seedBatch2() {
    return __awaiter(this, void 0, void 0, function* () {
        const inserted = yield database_1.database.insert(schema_1.tourismEntries).values(exports.tourismEntriesBatch2).returning();
        console.log(`Inserted ${inserted.length} tourism entries (batch 2).`);
        return inserted;
    });
}
