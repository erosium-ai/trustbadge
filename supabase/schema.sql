
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

-- ---------------------------------------------------------------------------
-- Grants for Supabase roles
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trustbadges TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credentials TO authenticated, service_role;
GRANT SELECT, INSERT ON public.review_events TO authenticated, service_role;
GRANT SELECT ON public.admin_roles TO authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
