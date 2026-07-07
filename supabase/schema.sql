
-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id uuid NOT NULL REFERENCES public.credentials(id) ON DELETE CASCADE,
  trustbadge_id uuid NOT NULL REFERENCES public.trustbadges(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('verified', 'rejected')),
  reviewer_email text,
  note text,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_events_reviewed_at_desc
  ON public.review_events (reviewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_events_trustbadge_id
  ON public.review_events (trustbadge_id);

CREATE INDEX IF NOT EXISTS idx_review_events_credential_id
  ON public.review_events (credential_id);

CREATE TABLE IF NOT EXISTS public.conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  trustbadge_id uuid REFERENCES public.trustbadges(id) ON DELETE SET NULL,
  user_id uuid,
  source text,
  source_slug text,
  campaign text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_occurred_at_desc
  ON public.conversion_events (occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversion_events_event_name
  ON public.conversion_events (event_name);

CREATE INDEX IF NOT EXISTS idx_conversion_events_source_campaign
  ON public.conversion_events (source, campaign);

CREATE INDEX IF NOT EXISTS idx_conversion_events_trustbadge_id
  ON public.conversion_events (trustbadge_id);

ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversion_events_service_role_all ON public.conversion_events;
CREATE POLICY conversion_events_service_role_all
  ON public.conversion_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('review_admin', 'super_admin', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_roles_email_active
  ON public.admin_roles (email, is_active);

ALTER TABLE public.trustbadges
  ADD COLUMN IF NOT EXISTS verification_confidence text,
  ADD COLUMN IF NOT EXISTS verification_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_summary text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'trustbadges_verification_confidence_check'
  ) THEN
    ALTER TABLE public.trustbadges
      ADD CONSTRAINT trustbadges_verification_confidence_check
      CHECK (verification_confidence IN ('high', 'medium', 'low') OR verification_confidence IS NULL);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Grants for Supabase roles
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trustbadges TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credentials TO authenticated, service_role;
GRANT SELECT, INSERT ON public.review_events TO authenticated, service_role;
REVOKE ALL ON public.conversion_events FROM anon, authenticated;
GRANT SELECT, INSERT ON public.conversion_events TO service_role;
GRANT SELECT ON public.admin_roles TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
