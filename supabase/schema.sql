-- TrustBadge Week 1 MVP database schema
-- Apply via Supabase SQL Editor or migrations on erosium-core-prod

-- ---------------------------------------------------------------------------
-- Enums (as check constraints for easy reuse in the same schema)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credential_type') THEN
    CREATE TYPE credential_type AS ENUM (
      'trade_license',
      'public_liability',
      'abn',
      'police_check',
      'first_aid'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credential_status') THEN
    CREATE TYPE credential_status AS ENUM (
      'pending',
      'verified',
      'rejected'
    );
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- TrustBadges table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trustbadges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  business_name text NOT NULL,
  abn text,
  status text NOT NULL DEFAULT 'draft',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Constrain badge status values
ALTER TABLE trustbadges
  DROP CONSTRAINT IF EXISTS trustbadges_status_check;

ALTER TABLE trustbadges
  ADD CONSTRAINT trustbadges_status_check
  CHECK (status IN ('draft', 'pending_review', 'verified', 'rejected', 'suspended'));

-- ---------------------------------------------------------------------------
-- Credentials table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trustbadge_id uuid NOT NULL REFERENCES trustbadges(id) ON DELETE CASCADE,
  type credential_type NOT NULL,
  file_url text,
  status credential_status NOT NULL DEFAULT 'pending',
  verified_at timestamptz,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Storage bucket setup
-- Requires the 'trustbadge-creds' storage bucket to be created separately via
-- the Supabase Storage UI / CLI / admin API. This schema grants usage.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_trustbadges_slug ON trustbadges(slug);
CREATE INDEX IF NOT EXISTS idx_trustbadges_user_id ON trustbadges(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_trustbadge_id ON credentials(trustbadge_id);
CREATE INDEX IF NOT EXISTS idx_credentials_status ON credentials(status);
CREATE INDEX IF NOT EXISTS idx_credentials_type ON credentials(type);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE trustbadges ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Service role bypass using Postgres role detection
CREATE OR REPLACE FUNCTION current_user_is_service_role()
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'role',
    ''
  ) = 'service_role';
$$;

-- Auth helper
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
    ''
  )::uuid;
$$;

-- ---------------------------------------------------------------------------
-- TrustBadges policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "TrustBadges public read" ON trustbadges;
CREATE POLICY "TrustBadges public read"
  ON trustbadges FOR SELECT
  TO authenticated, anon, service_role
  USING (true);

DROP POLICY IF EXISTS "TrustBadges owner full access" ON trustbadges;
CREATE POLICY "TrustBadges owner full access"
  ON trustbadges FOR ALL
  TO authenticated
  USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());

DROP POLICY IF EXISTS "TrustBadges service_role bypass" ON trustbadges;
CREATE POLICY "TrustBadges service_role bypass"
  ON trustbadges FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Credentials policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Credentials public read verified" ON credentials;
CREATE POLICY "Credentials public read verified"
  ON credentials FOR SELECT
  TO authenticated, anon, service_role
  USING (status = 'verified');

DROP POLICY IF EXISTS "Credentials owner read" ON credentials;
CREATE POLICY "Credentials owner read"
  ON credentials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trustbadges t
      WHERE t.id = credentials.trustbadge_id
        AND t.user_id = current_user_id()
    )
  );

DROP POLICY IF EXISTS "Credentials owner insert" ON credentials;
CREATE POLICY "Credentials owner insert"
  ON credentials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trustbadges t
      WHERE t.id = credentials.trustbadge_id
        AND t.user_id = current_user_id()
    )
  );

DROP POLICY IF EXISTS "Credentials service_role bypass" ON credentials;
CREATE POLICY "Credentials service_role bypass"
  ON credentials FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Updated-at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trustbadges_updated_at ON trustbadges;
CREATE TRIGGER trustbadges_updated_at
  BEFORE UPDATE ON trustbadges
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS credentials_updated_at ON credentials;
CREATE TRIGGER credentials_updated_at
  BEFORE UPDATE ON credentials
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
