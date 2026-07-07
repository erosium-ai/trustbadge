-- ---------------------------------------------------------------------------
-- Sprint 2 migration plan: credential_type alignment (safe/forward path)
-- ---------------------------------------------------------------------------
-- Purpose:
--   Align database enum with richer credential taxonomy so UI + DB stay in sync.
--
-- Current production state observed:
--   credential_type accepts: trade_license, first_aid, abn
--
-- This script is intentionally additive + reversible-by-backup approach.
-- Apply only after taking a DB backup/snapshot.
-- ---------------------------------------------------------------------------

BEGIN;

-- 1) Create an expanded enum type if needed.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credential_type_v2') THEN
    CREATE TYPE public.credential_type_v2 AS ENUM (
      'trade_license',
      'qbcc_licence',
      'electrical_licence',
      'plumbing_licence',
      'public_liability',
      'workers_compensation',
      'abn',
      'police_check',
      'blue_card',
      'first_aid',
      'other_licence'
    );
  END IF;
END$$;

-- 2) Add temporary column using v2 enum.
ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS type_v2 public.credential_type_v2;

-- 3) Copy values from old type into new type where possible.
UPDATE public.credentials
SET type_v2 = type::text::public.credential_type_v2
WHERE type_v2 IS NULL;

-- 4) Enforce non-null once backfilled.
ALTER TABLE public.credentials
  ALTER COLUMN type_v2 SET NOT NULL;

-- 5) Swap columns.
ALTER TABLE public.credentials DROP COLUMN type;
ALTER TABLE public.credentials RENAME COLUMN type_v2 TO type;

-- 6) Rename enum type for canonical naming.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credential_type') THEN
    ALTER TYPE public.credential_type RENAME TO credential_type_legacy;
  END IF;

  ALTER TYPE public.credential_type_v2 RENAME TO credential_type;
END$$;

COMMIT;

-- Optional post-check:
-- SELECT unnest(enum_range(NULL::public.credential_type));
