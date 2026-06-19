-- Adds structured, tiered pricing support to tourism_entries.
-- priceRWF / priceUSD stay as-is (used as a single "representative" display
-- price, e.g. for list views), pricing_details carries the full breakdown
-- (residency tiers, group rates, distance formulas, etc.) so we stop losing
-- the real RDB/RURA/RCHA data by flattening it into one number.

ALTER TABLE "tourism_entries" ADD COLUMN "pricing_details" jsonb;
