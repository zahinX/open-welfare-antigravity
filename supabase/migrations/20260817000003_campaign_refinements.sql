-- Migration: Add currency, verification_text, and verification_link to campaigns table

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'BDT',
  ADD COLUMN IF NOT EXISTS verification_text TEXT,
  ADD COLUMN IF NOT EXISTS verification_link TEXT;

-- Comment for documentation
COMMENT ON COLUMN campaigns.currency IS '3-letter ISO 4217 currency code (e.g. BDT, USD, EUR)';
COMMENT ON COLUMN campaigns.verification_text IS 'Dynamic verification details provided by admin';
COMMENT ON COLUMN campaigns.verification_link IS 'Optional external URL for verification/documentation proof';
