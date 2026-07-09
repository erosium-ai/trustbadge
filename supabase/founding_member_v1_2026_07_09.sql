-- 🔑 Keywords: Credentials AI Founding Member v1, business_profiles subscription columns, founding_number, verification_status, stripe_customer_id, stripe_subscription_id
-- Founding Member v1 database additions
-- Date: 2026-07-09
-- Scope: additive, replay-safe. Adds Stripe subscription tracking, founding member number,
--        and customer-facing verification status enum to business_profiles.
-- Companion spec: PROJECTS/agent-website-project/CREDENTIALS_AI_FOUNDER_DASHBOARD_SPEC_FABLE_FIVE_2026-07-09.md

BEGIN;

-- ---------------------------------------------------------------------------
-- Column additions to business_profiles
-- ---------------------------------------------------------------------------

ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS founding_number integer,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS next_payment_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_email text;

-- ---------------------------------------------------------------------------
-- Constraints (idempotent)
-- ---------------------------------------------------------------------------

-- Verification status enum (customer-facing 5 states from Fable Five §6)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_profiles_verification_status_check'
      AND conrelid = 'public.business_profiles'::regclass
  ) THEN
    ALTER TABLE public.business_profiles
      ADD CONSTRAINT business_profiles_verification_status_check
      CHECK (verification_status IN ('not_started', 'in_review', 'verified', 'action_needed', 'expiring_soon'));
  END IF;
END$$;

-- Subscription status enum (matches Stripe subscription.status)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_profiles_subscription_status_check'
      AND conrelid = 'public.business_profiles'::regclass
  ) THEN
    ALTER TABLE public.business_profiles
      ADD CONSTRAINT business_profiles_subscription_status_check
      CHECK (
        subscription_status IS NULL
        OR subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')
      );
  END IF;
END$$;

-- Founding number sanity: 1..500 (soft ceiling; Fable Five caps at 50 socially)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_profiles_founding_number_check'
      AND conrelid = 'public.business_profiles'::regclass
  ) THEN
    ALTER TABLE public.business_profiles
      ADD CONSTRAINT business_profiles_founding_number_check
      CHECK (founding_number IS NULL OR founding_number BETWEEN 1 AND 500);
  END IF;
END$$;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_business_profiles_stripe_customer_id
  ON public.business_profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_business_profiles_stripe_subscription_id
  ON public.business_profiles (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_business_profiles_founding_number
  ON public.business_profiles (founding_number)
  WHERE founding_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_business_profiles_verification_status
  ON public.business_profiles (verification_status);

-- ---------------------------------------------------------------------------
-- Unique founding_number when set (prevent duplicate ranks)
-- ---------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_profiles_founding_number_unique
  ON public.business_profiles (founding_number)
  WHERE founding_number IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Founding-member assignment function (atomic, race-safe)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.credentials_ai_assign_founding_number(target_slug text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_number integer;
  next_number integer;
BEGIN
  SELECT founding_number INTO existing_number
    FROM public.business_profiles
    WHERE slug = target_slug
    FOR UPDATE;

  IF existing_number IS NOT NULL THEN
    RETURN existing_number;
  END IF;

  SELECT COALESCE(MAX(founding_number), 0) + 1
    INTO next_number
    FROM public.business_profiles
    WHERE founding_number IS NOT NULL;

  UPDATE public.business_profiles
    SET founding_number = next_number,
        plan = 'founder',
        updated_at = now()
    WHERE slug = target_slug;

  RETURN next_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.credentials_ai_assign_founding_number(text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.credentials_ai_assign_founding_number(text) FROM anon, authenticated;

COMMIT;
