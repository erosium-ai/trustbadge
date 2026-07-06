# TrustBadge — Week 1 MVP

A first-pass verified-credential badge for tradies and small businesses.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- Supabase (Auth, Postgres, Storage)
- Stripe SDK pre-installed for later billing
- Railway deploy config

## Quick start

```bash
cd trustbadge
cp .env.example .env.local
# fill in your Supabase env vars
npm run dev
```

## Database

Apply `supabase/schema.sql` to the `erosium-core-prod` Supabase project. It creates:

- `trustbadges` table
- `credentials` table with credential type / status enums
- RLS policies for public read, owner access, and service_role bypass
- Indexes + updated_at triggers

Then create a Supabase Storage bucket named `trustbadge-creds` with public read enabled.

## Pages

- `/` — landing page
- `/register` — create account + trust badge
- `/login` — sign in
- `/dashboard/[slug]` — owner dashboard, upload credentials
- `/badge/[slug]` — public trust badge with JSON-LD structured data
- `/api/health` — Railway healthcheck

## Build

```bash
npm run build
```

Should exit with zero errors before deploy.

## Notes

- ABN verification and QBCC scrape are planned for Week 2.
- Registration uses service_role for the trustbadge insert because RLS inserts
  are scoped to `user_id = current_user_id()`; the auth user is created first,
  then the server helper inserts the row with service role.
