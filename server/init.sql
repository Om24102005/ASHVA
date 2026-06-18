-- =============================================================================
-- ASHVA — relational schema (rental). Postgres 16. Runs once on first init.
-- Accounts/credentials/sessions/social, conditional contact onboarding,
-- custom KYC, fleet (assets) and bookings with geofencing.
-- =============================================================================
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_role      AS ENUM ('user', 'admin');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE onboarding_path AS ENUM ('email_first', 'phone_first', 'social_first');
CREATE TYPE social_provider AS ENUM ('google', 'apple', 'facebook');
CREATE TYPE kyc_doc_type   AS ENUM ('aadhaar', 'pan', 'passport', 'driving_licence', 'voter_id');
CREATE TYPE kyc_status     AS ENUM ('not_started', 'pending', 'in_review', 'approved', 'rejected');
CREATE TYPE asset_type     AS ENUM ('motorcycle', 'scooter', 'gear');
CREATE TYPE asset_status   AS ENUM ('available', 'booked', 'maintenance', 'retired');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ---- accounts / auth --------------------------------------------------------
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name  text,
  role          user_role NOT NULL DEFAULT 'user',
  status        account_status NOT NULL DEFAULT 'active',
  onboarding    onboarding_path,
  avatar_url    text,
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_status ON users(status);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE credentials (
  user_id        uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash  text NOT NULL,
  failed_attempts int NOT NULL DEFAULT 0,
  locked_until   timestamptz,
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_cred_updated BEFORE UPDATE ON credentials FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE auth_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  text NOT NULL UNIQUE,
  device_label text,
  expires_at  timestamptz NOT NULL,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_user ON auth_sessions(user_id);

CREATE TABLE social_accounts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    social_provider NOT NULL,
  provider_uid text NOT NULL,
  email       citext,
  raw_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_uid)
);
CREATE INDEX idx_social_user ON social_accounts(user_id);

-- ---- conditional contact (gatekeeper reads *_verified) ----------------------
CREATE TABLE contact_info (
  user_id           uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email             citext UNIQUE,
  email_verified    boolean NOT NULL DEFAULT false,
  email_verified_at timestamptz,
  phone             text UNIQUE,
  phone_verified    boolean NOT NULL DEFAULT false,
  phone_verified_at timestamptz,
  country_code      text NOT NULL DEFAULT '+91',
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_email ON contact_info(email);
CREATE INDEX idx_contact_phone ON contact_info(phone);
CREATE TRIGGER trg_contact_updated BEFORE UPDATE ON contact_info FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---- custom KYC -------------------------------------------------------------
CREATE TABLE kyc_records (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type     kyc_doc_type NOT NULL,
  id_number    text NOT NULL,
  full_name    text,
  status       kyc_status NOT NULL DEFAULT 'pending',
  review_notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at  timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, doc_type)
);
CREATE INDEX idx_kyc_user ON kyc_records(user_id);
CREATE TRIGGER trg_kyc_updated BEFORE UPDATE ON kyc_records FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE kyc_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_id      uuid NOT NULL REFERENCES kyc_records(id) ON DELETE CASCADE,
  page_label  text NOT NULL,
  storage_url text NOT NULL,
  mime_type   text NOT NULL,
  byte_size   bigint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_kycdoc_kyc ON kyc_documents(kyc_id);

-- ---- fleet + bookings -------------------------------------------------------
CREATE TABLE assets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE,
  name          text NOT NULL,
  maker         text,
  type          asset_type NOT NULL DEFAULT 'motorcycle',
  status        asset_status NOT NULL DEFAULT 'available',
  price_per_day numeric(10,2) NOT NULL DEFAULT 0,
  rating        numeric(2,1),
  latitude      double precision,
  longitude     double precision,
  specs         jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_assets_status ON assets(status);
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE bookings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference    text NOT NULL UNIQUE,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id     uuid NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  status       booking_status NOT NULL DEFAULT 'confirmed',
  hub          text,
  start_ts     timestamptz NOT NULL,
  end_ts       timestamptz NOT NULL,
  days         int NOT NULL DEFAULT 1,
  gear         jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  geofence     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_booking_window CHECK (end_ts > start_ts)
);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_asset ON bookings(asset_id);
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---- seed: ASHVA fleet ------------------------------------------------------
INSERT INTO assets (slug, name, maker, type, price_per_day, rating, specs) VALUES
 ('him','Himalayan 450','ROYAL ENFIELD','motorcycle',1800,4.9,
   '{"kicker":"ADVENTURE","engine":"452cc","power":"40 bhp","range":"450 km","tagline":"Built for the high passes."}'::jsonb),
 ('lw','LiveWire One','HARLEY-DAVIDSON','motorcycle',3600,4.8,
   '{"kicker":"ELECTRIC","engine":"15.5 kWh","power":"105 bhp","range":"235 km","tagline":"Silent. Instant. Relentless."}'::jsonb),
 ('duc','SuperSport 950','DUCATI','motorcycle',4200,4.9,
   '{"kicker":"SPORT","engine":"937cc","power":"110 bhp","range":"300 km","tagline":"Italian fire, road-tuned."}'::jsonb),
 ('r6','YZF-R6','YAMAHA','motorcycle',3900,4.7,
   '{"kicker":"SUPERSPORT","engine":"599cc","power":"117 bhp","range":"260 km","tagline":"Born on the circuit."}'::jsonb),
 ('ktm','790 Duke','KTM','motorcycle',3200,4.8,
   '{"kicker":"NAKED","engine":"799cc","power":"105 bhp","range":"330 km","tagline":"The scalpel of the hills."}'::jsonb);

COMMIT;
