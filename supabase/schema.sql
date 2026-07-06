

-- ---------------------------------------------------------------------------
-- Grants for Supabase roles
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trustbadges TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credentials TO authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;