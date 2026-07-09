// 🔑 Keywords: Credentials AI dashboard queries, proof snapshot, recent enquiries, weekly summary, ownership guard
// Server-side queries for the Founding Member dashboard v1. All read paths
// use the service-role client (bypassing RLS) after callers have already
// verified ownership.
import { getServiceClient } from "./supabase";
import type { FoundingMemberRecord } from "./founding-member";

export interface DashboardBusiness extends FoundingMemberRecord {
  // Extra fields shown in the header/overview.
}

export interface DashboardLead {
  id: string;
  type: string;
  source: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export interface ProofSnapshot {
  calls: number;
  emailClicks: number;
  quoteRequests: number;
  topSource: string | null;
  totalEvents: number;
  since: string;
}

const SOURCE_LABELS: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  direct: "Direct",
  qr: "QR",
  email: "Email",
  organic: "Organic",
};

export function prettySource(raw: string | null | undefined): string {
  if (!raw) return "Direct";
  const key = raw.toLowerCase();
  if (SOURCE_LABELS[key]) return SOURCE_LABELS[key];
  // Common UTM values: google_ads, google-cpc, gbp_listing, etc — trim to first token.
  const first = key.split(/[_\-\s]/)[0];
  if (SOURCE_LABELS[first]) return SOURCE_LABELS[first];
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export async function getRecentLeads(
  businessProfileId: string,
  limit = 5
): Promise<DashboardLead[]> {
  const client = getServiceClient();
  const { data, error } = await client
    .from("lead_events")
    .select("id, type, source, name, phone, email, message, status, created_at")
    .eq("business_profile_id", businessProfileId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as unknown as DashboardLead[];
}

export async function getProofSnapshot(
  businessProfileId: string,
  daysBack = 7
): Promise<ProofSnapshot> {
  const client = getServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - daysBack);
  const sinceIso = since.toISOString();

  const { data, error } = await client
    .from("lead_events")
    .select("type, source")
    .eq("business_profile_id", businessProfileId)
    .gte("created_at", sinceIso);

  if (error || !data) {
    return {
      calls: 0,
      emailClicks: 0,
      quoteRequests: 0,
      topSource: null,
      totalEvents: 0,
      since: sinceIso,
    };
  }

  const rows = data as unknown as { type: string; source: string | null }[];

  let calls = 0;
  let emailClicks = 0;
  let quoteRequests = 0;
  const sourceCounts = new Map<string, number>();

  for (const row of rows) {
    if (row.type === "call_click") calls++;
    if (row.type === "email_click") emailClicks++;
    if (row.type === "quote_form") quoteRequests++;
    const src = prettySource(row.source);
    sourceCounts.set(src, (sourceCounts.get(src) ?? 0) + 1);
  }

  let topSource: string | null = null;
  let topCount = 0;
  for (const [src, count] of sourceCounts) {
    if (count > topCount) {
      topCount = count;
      topSource = src;
    }
  }

  return {
    calls,
    emailClicks,
    quoteRequests,
    topSource,
    totalEvents: rows.length,
    since: sinceIso,
  };
}

export interface OwnershipCheck {
  ok: boolean;
  record: FoundingMemberRecord | null;
  reason?: "not_found" | "not_owner";
}

export async function assertOwnership(
  slug: string,
  userId: string
): Promise<OwnershipCheck> {
  const client = getServiceClient();
  const { data, error } = await client
    .from("business_profiles")
    .select(
      "id, slug, business_name, owner_user_id, plan, stripe_customer_id, stripe_subscription_id, subscription_status, founding_number, verification_status, next_payment_at, payment_email"
    )
    .eq("slug", slug.trim().toLowerCase())
    .maybeSingle();
  if (error || !data) return { ok: false, record: null, reason: "not_found" };
  const record = data as unknown as FoundingMemberRecord;
  if (record.owner_user_id !== userId) {
    // Fallback: allow if the user also owns the trustbadge record (legacy TrustBadge-only owners).
    const { data: bg } = await client
      .from("trustbadges")
      .select("user_id")
      .eq("slug", slug.trim().toLowerCase())
      .maybeSingle();
    const trustBadgeOwner =
      bg && typeof (bg as { user_id?: string }).user_id === "string"
        ? (bg as { user_id: string }).user_id
        : null;
    if (trustBadgeOwner !== userId) {
      return { ok: false, record, reason: "not_owner" };
    }
  }
  return { ok: true, record };
}

/**
 * Given a user id, return the primary business profile they own (if any).
 * Used by the /dashboard resolver + TopBar to route to /dashboard/[slug].
 */
export async function getPrimaryBusinessForUser(
  userId: string
): Promise<FoundingMemberRecord | null> {
  const client = getServiceClient();
  // Prefer business_profiles rows owned by this user (they carry lead engine
  // data and Founding Member state).
  const { data: bp } = await client
    .from("business_profiles")
    .select(
      "id, slug, business_name, owner_user_id, plan, stripe_customer_id, stripe_subscription_id, subscription_status, founding_number, verification_status, next_payment_at, payment_email"
    )
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (bp) return bp as unknown as FoundingMemberRecord;

  // Fallback for legacy TrustBadge-only owners.
  const { data: tb } = await client
    .from("trustbadges")
    .select("slug, business_name")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!tb) return null;

  return {
    id: "",
    slug: (tb as { slug: string }).slug,
    business_name: (tb as { business_name: string }).business_name,
    owner_user_id: userId,
    plan: "free",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: null,
    founding_number: null,
    verification_status: "not_started",
    next_payment_at: null,
    payment_email: null,
  } satisfies FoundingMemberRecord;
}

export interface ChecklistState {
  profileLive: boolean;
  verificationStatus: string;
  hasFirstLead: boolean;
  shareStepMarked: boolean;
}

export async function getChecklistState(
  businessProfileId: string,
  verificationStatus: string
): Promise<ChecklistState> {
  const client = getServiceClient();
  const { count } = await client
    .from("lead_events")
    .select("id", { count: "exact", head: true })
    .eq("business_profile_id", businessProfileId)
    .limit(1);
  return {
    profileLive: true, // if the business_profiles row exists and slug is set, profile is live
    verificationStatus,
    hasFirstLead: typeof count === "number" && count > 0,
    shareStepMarked: false, // v1: no way to mark this yet; UI will always show it as pending
  };
}
