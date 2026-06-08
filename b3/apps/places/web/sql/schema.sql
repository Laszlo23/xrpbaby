-- KYC + wallet binding for ComplianceRegistry relay (run against Postgres manually or in CI).

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_bindings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (address)
);

CREATE TABLE IF NOT EXISTS kyc_applications (
  id SERIAL PRIMARY KEY,
  applicant_external_id TEXT,
  user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  wallet_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT NOT NULL DEFAULT 'sumsub',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_applicant ON kyc_applications (applicant_external_id);

CREATE TABLE IF NOT EXISTS siwe_nonces (
  address TEXT PRIMARY KEY,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id SERIAL PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_wallet ON kyc_applications (wallet_address);

CREATE TABLE IF NOT EXISTS issuer_applications (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applicant_wallet TEXT NOT NULL,
  parcel_label TEXT NOT NULL,
  metadata_uri TEXT,
  metadata_ciphertext TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_issuer_wallet ON issuer_applications (applicant_wallet);

-- RWA Marketplace listings
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS rwa_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  wallet TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  ownership_model TEXT NOT NULL DEFAULT 'fractional',
  metadata_json JSONB NOT NULL DEFAULT '{}',
  property_id_onchain TEXT,
  share_token_address TEXT,
  gaps JSONB NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_rwa_listings_wallet ON rwa_listings (wallet);
CREATE INDEX IF NOT EXISTS idx_rwa_listings_status ON rwa_listings (status);

CREATE TABLE IF NOT EXISTS listing_media (
  id SERIAL PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES rwa_listings (id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  kind TEXT NOT NULL DEFAULT 'photo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_documents (
  id SERIAL PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES rwa_listings (id) ON DELETE CASCADE,
  doc_kind TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  content_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_events (
  id SERIAL PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES rwa_listings (id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  actor TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_listing ON verification_events (listing_id);

CREATE TABLE IF NOT EXISTS watchlist (
  id SERIAL PRIMARY KEY,
  wallet TEXT NOT NULL,
  property_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (wallet, property_id)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_wallet ON watchlist (wallet);

CREATE TABLE IF NOT EXISTS listing_ai_summaries (
  listing_id UUID PRIMARY KEY REFERENCES rwa_listings (id) ON DELETE CASCADE,
  summary_md TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate legacy issuer applications into rwa_listings (idempotent)
INSERT INTO rwa_listings (wallet, status, ownership_model, metadata_json, created_at, updated_at)
SELECT
  applicant_wallet,
  'submitted',
  'fractional',
  jsonb_build_object(
    'title', parcel_label,
    'parcelLabel', parcel_label,
    'metadataUri', metadata_uri,
    'notes', notes
  ),
  created_at,
  created_at
FROM issuer_applications ia
WHERE NOT EXISTS (
  SELECT 1 FROM rwa_listings rl
  WHERE rl.wallet = ia.applicant_wallet
    AND rl.metadata_json->>'parcelLabel' = ia.parcel_label
);
