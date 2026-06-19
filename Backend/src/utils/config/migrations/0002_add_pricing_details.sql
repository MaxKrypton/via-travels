-- Adds structured, tiered pricing support to tourism_entries.
-- The flat price_rwf / price_usd columns remain for list-display prices;
-- pricing_details stores full residency tiers, group rates, route tables,
-- distance formulas, and other source-specific pricing structures.

ALTER TABLE "tourism_entries" ADD COLUMN IF NOT EXISTS "pricing_details" jsonb;
