-- 🔑 Keywords: Credentials AI V2, Family GTM, promo code, complimentary lifetime access, atomic redemption, claim token, service-role only
-- Promo code v1 database additions (Family GTM)
-- Date: 2026-08-01
-- Scope: additive, replay-safe. Isolates complimentary lifetime grants from Stripe lifecycle.
-- Companion plan: PROJECTS/agent-website-project/CREDENTIALS_AI_V2_FAMILY_GTM_PROMO_IMPLEMENTATION_PLAN_V1_2026-08-01.md
--
-- Compatibility notes:
--   * Existing Stripe customers remain identified by stripe_* / subscription_status fields.
--   * Promo recipients use plan='founder' (internal V2 premium compatibility ONLY) with
--     subscription_status NULL and access_grant_type = 'complimentary_lifetime'.
--   * Do NOT widen or drop business_profiles_subscription_status_check.
--   * No plaintext promo codes or claim tokens are stored — digests only.
--   * Tables/RPCs are service_role only (anon/authenticated revoked).

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Access-grant columns on business_profiles (additive)
-- ---------------------------------------------------------------------------

ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS access_grant_type text,
  ADD COLUMN IF NOT EXISTS access_granted_at timestamptz,
  ADD COLUMN IF NOT EXISTS access_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS access_grant_redemption_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_profiles_access_grant_type_check'
      AND conrelid = 'public.business_profiles'::regclass
  ) THEN
    ALTER TABLE public.business_profiles
      ADD CONSTRAINT business_profiles_access_grant_type_check
      CHECK (
        access_grant_type IS NULL
        OR access_grant_type IN ('complimentary_lifetime')
      );
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_business_profiles_access_grant_type
  ON public.business_profiles (access_grant_type)
  WHERE access_grant_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_business_profiles_access_grant_redemption_id
  ON public.business_profiles (access_grant_redemption_id)
  WHERE access_grant_redemption_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. promo_codes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_digest text NOT NULL,
  code_hint text NOT NULL,
  campaign text NOT NULL,
  recipient_label text,
  business_hint text,
  benefit_type text NOT NULL DEFAULT 'complimentary_lifetime',
  max_uses integer NOT NULL DEFAULT 1,
  use_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by text NOT NULL DEFAULT 'ike',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT promo_codes_code_digest_unique UNIQUE (code_digest),
  CONSTRAINT promo_codes_max_uses_check CHECK (max_uses >= 1),
  CONSTRAINT promo_codes_use_count_check CHECK (use_count >= 0 AND use_count <= max_uses),
  CONSTRAINT promo_codes_benefit_type_check CHECK (benefit_type IN ('complimentary_lifetime'))
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_campaign
  ON public.promo_codes (campaign);

CREATE INDEX IF NOT EXISTS idx_promo_codes_active
  ON public.promo_codes (is_active)
  WHERE is_active = true;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promo_codes_service_role_all ON public.promo_codes;
CREATE POLICY promo_codes_service_role_all
  ON public.promo_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.promo_codes FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO service_role;

-- ---------------------------------------------------------------------------
-- 3. promo_redemptions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id),
  slug text NOT NULL,
  account_email text NOT NULL,
  benefit_type text NOT NULL DEFAULT 'complimentary_lifetime',
  claim_token_digest text NOT NULL,
  claim_token_expires_at timestamptz NOT NULL,
  claimed_at timestamptz,
  owner_user_id uuid,
  legal_accepted_at timestamptz NOT NULL,
  terms_version text NOT NULL,
  privacy_version text NOT NULL,
  refunds_version text NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  redeemed_ip_hash text,
  user_agent_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promo_redemptions_claim_token_digest_unique UNIQUE (claim_token_digest),
  CONSTRAINT promo_redemptions_benefit_type_check CHECK (benefit_type IN ('complimentary_lifetime'))
);

-- Single-use Family GTM codes: one redemption row per promo code.
CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_redemptions_promo_code_id_unique
  ON public.promo_redemptions (promo_code_id);

-- One complimentary grant redemption per slug.
CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_redemptions_slug_benefit_unique
  ON public.promo_redemptions (slug, benefit_type);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_slug
  ON public.promo_redemptions (slug);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_account_email
  ON public.promo_redemptions (account_email);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_claimed_at
  ON public.promo_redemptions (claimed_at)
  WHERE claimed_at IS NOT NULL;

ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_redemptions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promo_redemptions_service_role_all ON public.promo_redemptions;
CREATE POLICY promo_redemptions_service_role_all
  ON public.promo_redemptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.promo_redemptions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_redemptions TO service_role;

-- Optional FK from access grant column once both tables exist (idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_profiles_access_grant_redemption_id_fkey'
      AND conrelid = 'public.business_profiles'::regclass
  ) THEN
    ALTER TABLE public.business_profiles
      ADD CONSTRAINT business_profiles_access_grant_redemption_id_fkey
      FOREIGN KEY (access_grant_redemption_id)
      REFERENCES public.promo_redemptions(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- ---------------------------------------------------------------------------
-- 4. promo_redemption_attempts (brute-force control; no raw IPs)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.promo_redemption_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promo_redemption_attempts_ip_hash_created_at
  ON public.promo_redemption_attempts (ip_hash, created_at DESC);

ALTER TABLE public.promo_redemption_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_redemption_attempts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promo_redemption_attempts_service_role_all ON public.promo_redemption_attempts;
CREATE POLICY promo_redemption_attempts_service_role_all
  ON public.promo_redemption_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.promo_redemption_attempts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_redemption_attempts TO service_role;

-- ---------------------------------------------------------------------------
-- 5. Atomic redemption RPC
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.credentials_ai_redeem_promo_v1(
  p_code_digest text,
  p_target_slug text,
  p_claim_token_digest text,
  p_claim_expires_at timestamptz,
  p_accepted_at timestamptz,
  p_terms_version text,
  p_privacy_version text,
  p_refunds_version text,
  p_redeemed_ip_hash text DEFAULT NULL,
  p_user_agent_summary text DEFAULT NULL
)
RETURNS TABLE (
  redemption_id uuid,
  slug text,
  account_email text,
  claim_expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slug text;
  v_code public.promo_codes%ROWTYPE;
  v_page record;
  v_profile record;
  v_email text;
  v_redemption_id uuid;
  v_page_meta jsonb;
  v_service_areas jsonb;
  v_social_links jsonb;
  v_services jsonb;
  v_now timestamptz := COALESCE(p_accepted_at, now());
BEGIN
  -- 1. Normalize / validate slug
  v_slug := lower(trim(COALESCE(p_target_slug, '')));
  IF v_slug = '' OR v_slug !~ '^[a-z0-9-]{2,60}$' THEN
    RAISE EXCEPTION 'invalid_slug' USING ERRCODE = '22023';
  END IF;

  IF p_code_digest IS NULL OR length(trim(p_code_digest)) < 32 THEN
    RAISE EXCEPTION 'invalid_code_digest' USING ERRCODE = '22023';
  END IF;

  IF p_claim_token_digest IS NULL OR length(trim(p_claim_token_digest)) < 32 THEN
    RAISE EXCEPTION 'invalid_claim_token_digest' USING ERRCODE = '22023';
  END IF;

  IF p_claim_expires_at IS NULL OR p_claim_expires_at <= v_now THEN
    RAISE EXCEPTION 'invalid_claim_expiry' USING ERRCODE = '22023';
  END IF;

  IF COALESCE(trim(p_terms_version), '') = ''
     OR COALESCE(trim(p_privacy_version), '') = ''
     OR COALESCE(trim(p_refunds_version), '') = '' THEN
    RAISE EXCEPTION 'legal_versions_required' USING ERRCODE = '22023';
  END IF;

  -- 2–3. Lock promo code by digest; require active + remaining uses
  SELECT *
    INTO v_code
    FROM public.promo_codes
   WHERE code_digest = lower(trim(p_code_digest))
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'promo_unavailable' USING ERRCODE = 'P0002';
  END IF;

  IF v_code.is_active IS NOT TRUE
     OR v_code.use_count >= v_code.max_uses
     OR v_code.benefit_type IS DISTINCT FROM 'complimentary_lifetime' THEN
    RAISE EXCEPTION 'promo_unavailable' USING ERRCODE = 'P0002';
  END IF;

  -- 4–5. Lock pages row; require valid creator_email (server authority)
  SELECT
      p.id,
      p.slug,
      p.business_name,
      p.tagline,
      p.description,
      p.services,
      p.contact_email,
      p.contact_phone,
      p.website_url,
      p.location_address,
      p.social_links,
      p.metadata,
      p.brand_color,
      p.creator_email,
      p.is_pro
    INTO v_page
    FROM public.pages p
   WHERE p.slug = v_slug
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'page_not_found' USING ERRCODE = 'P0002';
  END IF;

  v_email := lower(trim(COALESCE(v_page.creator_email, '')));
  IF v_email = '' OR v_email !~ '^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$' THEN
    RAISE EXCEPTION 'account_email_unavailable' USING ERRCODE = '22023';
  END IF;

  -- 6. Ensure business_profiles row exists (hydrate from pages if needed)
  SELECT *
    INTO v_profile
    FROM public.business_profiles bp
   WHERE bp.slug = v_slug
   FOR UPDATE;

  IF NOT FOUND THEN
    v_page_meta := CASE
      WHEN v_page.metadata IS NULL THEN '{}'::jsonb
      WHEN jsonb_typeof(to_jsonb(v_page.metadata)) = 'object' THEN to_jsonb(v_page.metadata)
      ELSE '{}'::jsonb
    END;

    -- Preserve ABN snapshots from pages.metadata only; never invent pages.abn.
    v_service_areas := CASE
      WHEN jsonb_typeof(v_page_meta->'service_areas') = 'array' THEN v_page_meta->'service_areas'
      ELSE '[]'::jsonb
    END;

    v_services := CASE
      WHEN v_page.services IS NULL THEN '[]'::jsonb
      WHEN jsonb_typeof(to_jsonb(v_page.services)) = 'array' THEN to_jsonb(v_page.services)
      ELSE '[]'::jsonb
    END;

    v_social_links := CASE
      WHEN v_page.social_links IS NULL THEN '{}'::jsonb
      WHEN jsonb_typeof(to_jsonb(v_page.social_links)) = 'object' THEN to_jsonb(v_page.social_links)
      ELSE '{}'::jsonb
    END;

    INSERT INTO public.business_profiles (
      source_page_id,
      slug,
      business_name,
      description,
      phone,
      email,
      website,
      services,
      service_areas,
      social_links,
      metadata,
      plan,
      status,
      subscription_status,
      stripe_customer_id,
      stripe_subscription_id,
      next_payment_at,
      payment_email,
      access_grant_type,
      access_granted_at,
      access_expires_at,
      access_grant_redemption_id
    ) VALUES (
      v_page.id,
      v_slug,
      v_page.business_name,
      v_page.description,
      v_page.contact_phone,
      v_page.contact_email,
      v_page.website_url,
      v_services,
      v_service_areas,
      v_social_links,
      (
        v_page_meta
        || jsonb_build_object(
          'tagline', v_page.tagline,
          'location_address', v_page.location_address,
          'brand_color', v_page.brand_color,
          'hydrated_from_pages_at', v_now
        )
      ),
      'free',
      'active',
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL
    )
    RETURNING * INTO v_profile;
  END IF;

  -- 7–8. Reject without consuming code if profile is ineligible
  IF v_profile.owner_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'profile_not_eligible' USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(trim(v_profile.stripe_customer_id), '') <> ''
     OR COALESCE(trim(v_profile.stripe_subscription_id), '') <> '' THEN
    RAISE EXCEPTION 'profile_not_eligible' USING ERRCODE = 'P0001';
  END IF;

  IF v_profile.subscription_status IS NOT NULL THEN
    RAISE EXCEPTION 'profile_not_eligible' USING ERRCODE = 'P0001';
  END IF;

  IF lower(COALESCE(v_profile.plan, 'free')) IN (
    'founder', 'founding', 'founding_member', 'pro', 'paid', 'verified_lead_engine'
  ) THEN
    RAISE EXCEPTION 'profile_not_eligible' USING ERRCODE = 'P0001';
  END IF;

  IF v_profile.access_grant_type IS NOT NULL
     OR v_profile.access_grant_redemption_id IS NOT NULL THEN
    RAISE EXCEPTION 'profile_not_eligible' USING ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.promo_redemptions pr WHERE pr.slug = v_slug
  ) THEN
    RAISE EXCEPTION 'profile_not_eligible' USING ERRCODE = 'P0001';
  END IF;

  -- 9. Insert redemption with legal versions + claim token digest
  INSERT INTO public.promo_redemptions (
    promo_code_id,
    slug,
    account_email,
    benefit_type,
    claim_token_digest,
    claim_token_expires_at,
    legal_accepted_at,
    terms_version,
    privacy_version,
    refunds_version,
    redeemed_at,
    redeemed_ip_hash,
    user_agent_summary
  ) VALUES (
    v_code.id,
    v_slug,
    v_email,
    'complimentary_lifetime',
    lower(trim(p_claim_token_digest)),
    p_claim_expires_at,
    v_now,
    trim(p_terms_version),
    trim(p_privacy_version),
    trim(p_refunds_version),
    v_now,
    NULLIF(trim(COALESCE(p_redeemed_ip_hash, '')), ''),
    NULLIF(left(trim(COALESCE(p_user_agent_summary, '')), 300), '')
  )
  RETURNING id INTO v_redemption_id;

  -- 10. Mark page pro
  UPDATE public.pages p
     SET is_pro = true,
         updated_at = v_now
   WHERE p.slug = v_slug;

  -- 11. Grant profile entitlement (no Stripe fields, no founding_number, no payment_email)
  UPDATE public.business_profiles
     SET plan = 'founder',
         access_grant_type = 'complimentary_lifetime',
         access_granted_at = v_now,
         access_expires_at = NULL,
         access_grant_redemption_id = v_redemption_id,
         subscription_status = NULL,
         stripe_customer_id = NULL,
         stripe_subscription_id = NULL,
         next_payment_at = NULL,
         updated_at = v_now
   WHERE id = v_profile.id
     AND owner_user_id IS NULL
     AND access_grant_type IS NULL
     AND COALESCE(trim(stripe_customer_id), '') = ''
     AND COALESCE(trim(stripe_subscription_id), '') = '';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_not_eligible' USING ERRCODE = 'P0001';
  END IF;

  -- 12. Consume exactly one use
  UPDATE public.promo_codes
     SET use_count = use_count + 1,
         updated_at = v_now
   WHERE id = v_code.id
     AND is_active IS TRUE
     AND use_count < max_uses;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'promo_unavailable' USING ERRCODE = 'P0002';
  END IF;

  -- 13. Safe return values only
  redemption_id := v_redemption_id;
  slug := v_slug;
  account_email := v_email;
  claim_expires_at := p_claim_expires_at;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.credentials_ai_redeem_promo_v1(
  text, text, text, timestamptz, timestamptz, text, text, text, text, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.credentials_ai_redeem_promo_v1(
  text, text, text, timestamptz, timestamptz, text, text, text, text, text
) TO service_role;

-- ---------------------------------------------------------------------------
-- 6. Claim-consumption RPC
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.credentials_ai_consume_promo_claim_v1(
  p_claim_token_digest text,
  p_owner_user_id uuid
)
RETURNS TABLE (
  slug text,
  account_email text,
  redemption_id uuid,
  already_claimed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.promo_redemptions%ROWTYPE;
  v_profile public.business_profiles%ROWTYPE;
  v_now timestamptz := now();
BEGIN
  IF p_claim_token_digest IS NULL OR length(trim(p_claim_token_digest)) < 32 THEN
    RAISE EXCEPTION 'invalid_claim_token' USING ERRCODE = '22023';
  END IF;

  IF p_owner_user_id IS NULL THEN
    RAISE EXCEPTION 'owner_required' USING ERRCODE = '22023';
  END IF;

  SELECT *
    INTO v_redemption
    FROM public.promo_redemptions
   WHERE claim_token_digest = lower(trim(p_claim_token_digest))
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'claim_unavailable' USING ERRCODE = 'P0002';
  END IF;

  -- Already claimed by the same owner: idempotent success.
  IF v_redemption.claimed_at IS NOT NULL THEN
    IF v_redemption.owner_user_id IS NOT DISTINCT FROM p_owner_user_id THEN
      slug := v_redemption.slug;
      account_email := v_redemption.account_email;
      redemption_id := v_redemption.id;
      already_claimed := true;
      RETURN NEXT;
      RETURN;
    END IF;
    RAISE EXCEPTION 'claim_already_used' USING ERRCODE = 'P0001';
  END IF;

  IF v_redemption.claim_token_expires_at <= v_now THEN
    RAISE EXCEPTION 'claim_expired' USING ERRCODE = 'P0001';
  END IF;

  IF v_redemption.benefit_type IS DISTINCT FROM 'complimentary_lifetime' THEN
    RAISE EXCEPTION 'claim_unavailable' USING ERRCODE = 'P0002';
  END IF;

  SELECT *
    INTO v_profile
    FROM public.business_profiles
   WHERE public.business_profiles.slug = v_redemption.slug
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_missing' USING ERRCODE = 'P0002';
  END IF;

  IF v_profile.access_grant_redemption_id IS DISTINCT FROM v_redemption.id
     OR v_profile.access_grant_type IS DISTINCT FROM 'complimentary_lifetime'
     OR lower(COALESCE(v_profile.plan, '')) IS DISTINCT FROM 'founder' THEN
    RAISE EXCEPTION 'grant_mismatch' USING ERRCODE = 'P0001';
  END IF;

  IF v_profile.owner_user_id IS NOT NULL
     AND v_profile.owner_user_id IS DISTINCT FROM p_owner_user_id THEN
    RAISE EXCEPTION 'different_owner' USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(trim(v_profile.stripe_customer_id), '') <> ''
     OR COALESCE(trim(v_profile.stripe_subscription_id), '') <> '' THEN
    RAISE EXCEPTION 'profile_not_eligible' USING ERRCODE = 'P0001';
  END IF;

  -- Attach owner only while still ownerless (or already this owner).
  UPDATE public.business_profiles
     SET owner_user_id = p_owner_user_id,
         updated_at = v_now
   WHERE id = v_profile.id
     AND (
       owner_user_id IS NULL
       OR owner_user_id = p_owner_user_id
     );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'different_owner' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.promo_redemptions
     SET claimed_at = v_now,
         owner_user_id = p_owner_user_id
   WHERE id = v_redemption.id
     AND claimed_at IS NULL;

  IF NOT FOUND THEN
    -- Race: another claim won between lock and update.
    RAISE EXCEPTION 'claim_already_used' USING ERRCODE = 'P0001';
  END IF;

  slug := v_redemption.slug;
  account_email := v_redemption.account_email;
  redemption_id := v_redemption.id;
  already_claimed := false;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.credentials_ai_consume_promo_claim_v1(text, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.credentials_ai_consume_promo_claim_v1(text, uuid)
  TO service_role;

COMMIT;
