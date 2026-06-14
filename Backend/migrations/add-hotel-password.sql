-- Migration: Add access_password column to hotels table
-- This allows hotels to login directly with their Hotel ID

-- Add the access_password column
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS access_password TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN hotels.access_password IS 'Hashed password for direct hotel login using Hotel ID';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'hotels' AND column_name = 'access_password';
