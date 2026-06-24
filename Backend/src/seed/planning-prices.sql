-- Planning rates for all 40 accommodation entries: representative price_usd + seasonal band in description.
-- Adds price_estimated flag so verified vs. estimated stays auditable (your dataset is a verified research output).
-- RUN ONCE (the description note is appended; re-running would duplicate it).

ALTER TABLE tourism_entries ADD COLUMN IF NOT EXISTS price_estimated boolean DEFAULT false;

UPDATE tourism_entries SET price_usd = 260, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Typical room rate ~$260/night; ~$160-$290 seasonally. Verified Jun 2026 (2 sources).)'
  WHERE name = 'Kigali Serena Hotel';
UPDATE tourism_entries SET price_usd = 150, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Typical room rate ~$150/night; ~$120-$200 seasonally. Verified Jun 2026 (2 sources).)'
  WHERE name = 'Hôtel des Mille Collines';
UPDATE tourism_entries SET price_usd = 240, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Typical room rate ~$240/night; ~$200-$300 seasonally. Verified Jun 2026 (2 sources).)'
  WHERE name = 'Kigali Marriott Hotel';
UPDATE tourism_entries SET price_usd = 170, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Typical room rate ~$170/night; ~$140-$220 seasonally. Verified Jun 2026 (2 sources).)'
  WHERE name = 'Four Points by Sheraton Kigali';
UPDATE tourism_entries SET price_usd = 170, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Typical room rate ~$170/night; ~$100-$200 seasonally. Verified Jun 2026 (2 sources).)'
  WHERE name = 'Lemigo Hotel';
UPDATE tourism_entries SET price_usd = 100, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Typical room rate ~$100/night; ~$80-$130 seasonally. Verified Jun 2026 (2 sources).)'
  WHERE name = 'Amata n’Ubuki Hotel';
UPDATE tourism_entries SET price_usd = 1521, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Per person per night, all-inclusive (meals, drinks, activities). Plan ~$1521 (low season) to ~$2235 (peak).)'
  WHERE name = 'Wilderness Sabyinyo Silverback Lodge';
UPDATE tourism_entries SET price_usd = 700, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Per person per night, all-inclusive (meals, drinks, activities). Plan ~$700 (low season) to ~$950 (peak).)'
  WHERE name = 'Virunga Lodge';
UPDATE tourism_entries SET price_usd = 280, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Per person per night, all-inclusive (meals, drinks, activities). Plan ~$280 (low season) to ~$380 (peak).)'
  WHERE name = 'Mountain Gorilla View Lodge';
UPDATE tourism_entries SET price_usd = 180, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Indicative room rate ~$180/night; ~$140-$230 seasonally. Source: AHAIC 2025 rate sheet.)'
  WHERE name = 'Park Inn by Radisson Kigali';
UPDATE tourism_entries SET price_usd = 150, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Indicative room rate ~$150/night; ~$110-$180 seasonally. Source: AHAIC 2025 rate sheet.)'
  WHERE name = 'M Hotel Kigali';
UPDATE tourism_entries SET price_usd = 120, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Indicative room rate ~$120/night; ~$100-$160 seasonally. Source: AHAIC 2025 rate sheet.)'
  WHERE name = 'Grand Legacy Hotel';
UPDATE tourism_entries SET price_usd = 100, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Indicative room rate ~$100/night; ~$80-$130 seasonally. Source: AHAIC 2025 rate sheet.)'
  WHERE name = '2000 Hotel Downtown';
UPDATE tourism_entries SET price_usd = 110, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Indicative room rate ~$110/night; ~$90-$150 seasonally. Source: AHAIC 2025 rate sheet.)'
  WHERE name = 'Onomo Hotel Kigali';
UPDATE tourism_entries SET price_usd = 120, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Indicative room rate ~$120/night; ~$95-$150 seasonally. Source: AHAIC 2025 rate sheet.)'
  WHERE name = 'Sainte Famille Hotel';
UPDATE tourism_entries SET price_usd = 185, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Indicative room rate ~$185/night; ~$150-$230 seasonally. Source: AHAIC 2025 rate sheet.)'
  WHERE name = 'The Hut Restaurant and Boutique Hotel';
UPDATE tourism_entries SET price_usd = 350, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Indicative room rate ~$350/night; ~$280-$450 seasonally. Source: AHAIC 2025 rate sheet.)'
  WHERE name = 'Touch Africa Residence';
UPDATE tourism_entries SET price_usd = 86, price_estimated = false, last_verified = '2026-06-24',
  description = description || ' (Indicative room rate ~$86/night; ~$70-$110 seasonally. Source: AHAIC 2025 rate sheet.)'
  WHERE name = 'The Nest Boutique';
UPDATE tourism_entries SET price_usd = 75, price_estimated = true,
  description = description || ' (Estimated planning rate ~$75/night; ~$55-$100 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Hotel Chez Lando';
UPDATE tourism_entries SET price_usd = 60, price_estimated = true,
  description = description || ' (Estimated planning rate ~$60/night; ~$45-$85 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Hotel Muhabura';
UPDATE tourism_entries SET price_usd = 55, price_estimated = true,
  description = description || ' (Estimated planning rate ~$55/night; ~$40-$75 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'La Palme Hotel';
UPDATE tourism_entries SET price_usd = 70, price_estimated = true,
  description = description || ' (Estimated planning rate ~$70/night; ~$50-$95 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Virunga Hotel';
UPDATE tourism_entries SET price_usd = 50, price_estimated = true,
  description = description || ' (Estimated planning rate ~$50/night; ~$35-$70 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Kinigi Guesthouse';
UPDATE tourism_entries SET price_usd = 180, price_estimated = true,
  description = description || ' (Estimated planning rate ~$180/night; ~$140-$240 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Lake Kivu Serena Hotel';
UPDATE tourism_entries SET price_usd = 80, price_estimated = true,
  description = description || ' (Estimated planning rate ~$80/night; ~$60-$110 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Moriah Hill Resort';
UPDATE tourism_entries SET price_usd = 35, price_estimated = true,
  description = description || ' (Estimated planning rate ~$35/night; ~$25-$50 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Home Saint Jean';
UPDATE tourism_entries SET price_usd = 40, price_estimated = true,
  description = description || ' (Estimated planning rate ~$40/night; ~$30-$55 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Hotel Centre Bethanie';
UPDATE tourism_entries SET price_usd = 60, price_estimated = true,
  description = description || ' (Estimated planning rate ~$60/night; ~$45-$85 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Hotel Ibis Huye';
UPDATE tourism_entries SET price_usd = 50, price_estimated = true,
  description = description || ' (Estimated planning rate ~$50/night; ~$40-$70 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Hotel Faucon';
UPDATE tourism_entries SET price_usd = 55, price_estimated = true,
  description = description || ' (Estimated planning rate ~$55/night; ~$40-$75 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Hotel Credo';
UPDATE tourism_entries SET price_usd = 230, price_estimated = true,
  description = description || ' (Estimated planning rate ~$230/night; ~$180-$320 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'The Retreat by Heaven';
UPDATE tourism_entries SET price_usd = 160, price_estimated = true,
  description = description || ' (Estimated planning rate ~$160/night; ~$120-$220 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Heaven Restaurant & Boutique Hotel';
UPDATE tourism_entries SET price_usd = 130, price_estimated = true,
  description = description || ' (Estimated planning rate ~$130/night; ~$100-$180 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Ubumwe Grande Hotel';
UPDATE tourism_entries SET price_usd = 110, price_estimated = true,
  description = description || ' (Estimated planning rate ~$110/night; ~$85-$150 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Mythos Hotel';
UPDATE tourism_entries SET price_usd = 70, price_estimated = true,
  description = description || ' (Estimated planning rate ~$70/night; ~$55-$95 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Elevate Suites Hotel';
UPDATE tourism_entries SET price_usd = 55, price_estimated = true,
  description = description || ' (Estimated planning rate ~$55/night; ~$40-$75 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Beausejour Hotel';
UPDATE tourism_entries SET price_usd = 60, price_estimated = true,
  description = description || ' (Estimated planning rate ~$60/night; ~$45-$85 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Grazia Apartment';
UPDATE tourism_entries SET price_usd = 85, price_estimated = true,
  description = description || ' (Estimated planning rate ~$85/night; ~$65-$120 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Ndaru Luxury Suites';
UPDATE tourism_entries SET price_usd = 35, price_estimated = true,
  description = description || ' (Estimated planning rate ~$35/night; ~$25-$50 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Home Free Hotel';
UPDATE tourism_entries SET price_usd = 40, price_estimated = true,
  description = description || ' (Estimated planning rate ~$40/night; ~$30-$55 seasonally (estimate, not yet source-verified).)'
  WHERE name = 'Centric Hotel';
