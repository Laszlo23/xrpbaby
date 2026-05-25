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
