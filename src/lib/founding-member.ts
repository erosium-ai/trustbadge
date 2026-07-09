// 🔑 Keywords: Credentials AI founding member, business_profiles upsert, subscription mirror, welcome flow
// Server-side helpers for the /welcome flow and Founding Member membership state.

import { getServiceClient } from "./supabase";

export interface FoundingMemberUpsertInput {
  slug: string;
  paymentEmail?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  nextPaymentAt?: string | null; // ISO
  ownerUserId?: string | null;
}

export interface FoundingMemberRecord {
  id: string;
  slug: string;
  business_name: string;
  owner_user_id: string | null;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  founding_number: number | null;
  verification_status: string;
  next_payment_at: string | null;
  payment_email: string | null;
}

/**
 * Idempotent Founding Member upsert. Marks plan='founder', mirrors Stripe IDs
 * and next_payment_at, and (via RPC) assigns a founding_number exactly once.
 * If ownerUserId is provided and the row has no owner yet, it attaches.
 */
export async function upsertFoundingMember(
  input: FoundingMemberUpsertInput
): Promise<{ ok: boolean; reason?: string; record?: FoundingMemberRecord }> {
  const client = getServiceClient();
  const slug = input.slug.trim().toLowerCase();

  const { data: existing, error: fetchErr } = await client
    .from("business_profiles")
    .select(
      "id, slug, business_name, owner_user_id, plan, stripe_customer_id, stripe_subscription_id, subscription_status, founding_number, verification_status, next_payment_at, payment_email"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (fetchErr) {
    return { ok: false, reason: fetchErr.message };
  }
  if (!existing) {
    return { ok: false, reason: "profile_not_found" };
  }

  const update: Record<string, unknown> = {
    plan: "founder",
    subscription_status: input.subscriptionStatus ?? existing.subscription_status ?? null,
    stripe_customer_id: input.customerId ?? existing.stripe_customer_id ?? null,
    stripe_subscription_id:
      input.subscriptionId ?? existing.stripe_subscription_id ?? null,
    next_payment_at: input.nextPaymentAt ?? existing.next_payment_at ?? null,
    payment_email: input.paymentEmail ?? existing.payment_email ?? null,
    updated_at: new Date().toISOString(),
  };

  // Only claim ownership if there isn't one yet — never overwrite an owner.
  if (input.ownerUserId && !existing.owner_user_id) {
    update.owner_user_id = input.ownerUserId;
  }

  const { error: updErr } = await client
    .from("business_profiles")
    .update(update)
    .eq("id", existing.id);

  if (updErr) {
    return { ok: false, reason: updErr.message };
  }

  // Assign founding_number atomically (safe to call multiple times).
  let foundingNumber: number | null = existing.founding_number ?? null;
  if (foundingNumber == null) {
    const { data: rpcData, error: rpcErr } = await client.rpc(
      "credentials_ai_assign_founding_number",
      { target_slug: slug }
    );
    if (!rpcErr && typeof rpcData === "number") {
      foundingNumber = rpcData;
    }
  }

  const { data: refreshed } = await client
    .from("business_profiles")
    .select(
      "id, slug, business_name, owner_user_id, plan, stripe_customer_id, stripe_subscription_id, subscription_status, founding_number, verification_status, next_payment_at, payment_email"
    )
    .eq("id", existing.id)
    .maybeSingle();

  const record: FoundingMemberRecord = (refreshed as FoundingMemberRecord | null) ?? {
    id: existing.id as string,
    slug: existing.slug as string,
    business_name: existing.business_name as string,
    owner_user_id: (input.ownerUserId ?? existing.owner_user_id) as string | null,
    plan: "founder",
    stripe_customer_id: (update.stripe_customer_id as string | null) ?? null,
    stripe_subscription_id: (update.stripe_subscription_id as string | null) ?? null,
    subscription_status: (update.subscription_status as string | null) ?? null,
    founding_number: foundingNumber,
    verification_status: (existing.verification_status as string) ?? "not_started",
    next_payment_at: (update.next_payment_at as string | null) ?? null,
    payment_email: (update.payment_email as string | null) ?? null,
  };

  return { ok: true, record };
}

/**
 * Look up a Founding Member record by slug (service role, ignores RLS).
 */
export async function getFoundingMemberBySlug(
  slug: string
): Promise<FoundingMemberRecord | null> {
  const client = getServiceClient();
  const { data, error } = await client
    .from("business_profiles")
    .select(
      "id, slug, business_name, owner_user_id, plan, stripe_customer_id, stripe_subscription_id, subscription_status, founding_number, verification_status, next_payment_at, payment_email"
    )
    .eq("slug", slug.trim().toLowerCase())
    .maybeSingle();
  if (error) return null;
  return (data as FoundingMemberRecord | null) ?? null;
}

/**
 * Attach an existing Supabase auth user as the owner of a business_profiles
 * row (idempotent; only writes if no owner yet).
 */
export async function attachOwnerIfMissing(
  businessProfileId: string,
  userId: string
): Promise<{ ok: boolean; wasAttached: boolean; reason?: string }> {
  const client = getServiceClient();
  const { data: existing, error: fetchErr } = await client
    .from("business_profiles")
    .select("id, owner_user_id")
    .eq("id", businessProfileId)
    .maybeSingle();
  if (fetchErr || !existing) {
    return { ok: false, wasAttached: false, reason: fetchErr?.message ?? "not_found" };
  }
  if (existing.owner_user_id) {
    return { ok: true, wasAttached: false };
  }
  const { error: updErr } = await client
    .from("business_profiles")
    .update({ owner_user_id: userId, updated_at: new Date().toISOString() })
    .eq("id", businessProfileId);
  if (updErr) {
    return { ok: false, wasAttached: false, reason: updErr.message };
  }
  return { ok: true, wasAttached: true };
}
