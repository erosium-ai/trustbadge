// 🔑 Keywords: Credentials AI V2, Family GTM, promo claim auth, one-time claim token, complimentary lifetime access
// Server-side helpers for the isolated /promo/claim lane.
// Parallel to paid /welcome — does not touch Stripe session verification.

import { createHash, timingSafeEqual } from "node:crypto";
import { getServiceClient } from "./supabase";
import { getSiteUrl } from "./brand";
import { normalizeEmail } from "./founding-member";

export const PROMO_CLAIM_TOKEN_BYTES = 32;
export const PROMO_GENERIC_UNAVAILABLE = "promo_link_unavailable";
export const PROMO_ALREADY_CLAIMED = "promo_already_claimed";

export type PromoClaimLookup = {
  redemptionId: string;
  slug: string;
  accountEmail: string;
  claimedAt: string | null;
  ownerUserId: string | null;
  expiresAt: string;
  grantOk: boolean;
};

function digestHex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function hashClaimToken(token: string): string {
  const normalized = token.trim();
  if (!normalized) {
    throw new Error("empty_claim_token");
  }
  return digestHex(normalized);
}

export function isWellFormedClaimToken(token: unknown): token is string {
  if (typeof token !== "string") return false;
  const value = token.trim();
  // 32 random bytes as base64url ≈ 43 chars; accept hex (64) too.
  if (value.length < 32 || value.length > 128) return false;
  return /^[A-Za-z0-9\-_]+$/.test(value);
}

function isDuplicateEmailError(message?: string): boolean {
  const lowered = (message ?? "").toLowerCase();
  return (
    lowered.includes("already") &&
    (lowered.includes("registered") || lowered.includes("exists"))
  );
}

async function findAuthUserByEmail(
  email: string
): Promise<{ id: string; email: string } | null> {
  const client = getServiceClient();

  let page = 1;
  const perPage = 200;
  const MAX_PAGE_SCANS = 1_000_000;
  const visitedPages = new Set<number>();

  for (let scans = 0; scans < MAX_PAGE_SCANS; scans++) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`list_users_failed: ${error.message}`);
    }

    const users = data.users ?? [];
    const matched = users.find(
      (candidate) => normalizeEmail(candidate.email ?? null) === email
    );
    if (matched?.id) {
      return { id: matched.id, email };
    }

    const nextPage =
      typeof data.nextPage === "number" && Number.isFinite(data.nextPage)
        ? data.nextPage
        : null;

    if (users.length < perPage || !nextPage) {
      break;
    }

    if (nextPage === page || visitedPages.has(nextPage)) {
      throw new Error(
        `list_users_no_progress: page=${page} nextPage=${String(nextPage)}`
      );
    }

    visitedPages.add(page);
    page = nextPage;
  }

  return null;
}

export async function resolveOrCreatePromoAuthUser(
  email: string
): Promise<{ id: string; email: string }> {
  const client = getServiceClient();
  const normalized = normalizeEmail(email);
  if (!normalized) {
    throw new Error("invalid_account_email");
  }

  const existing = await findAuthUserByEmail(normalized);
  if (existing) return existing;

  const { data, error } = await client.auth.admin.createUser({
    email: normalized,
    email_confirm: true,
    user_metadata: { created_via_promo: true },
  });

  if (!error && data.user?.id) {
    return { id: data.user.id, email: normalized };
  }

  if (isDuplicateEmailError(error?.message)) {
    const raced = await findAuthUserByEmail(normalized);
    if (raced) return raced;
  }

  throw new Error(error?.message ?? "create_user_failed");
}

/**
 * Look up an unconsumed or previously-claimed redemption by claim-token digest.
 * Never trusts slug/email from the browser.
 */
export async function lookupPromoClaimByTokenDigest(
  claimTokenDigest: string
): Promise<PromoClaimLookup | null> {
  const client = getServiceClient();
  const digest = claimTokenDigest.trim().toLowerCase();

  const { data: redemption, error } = await client
    .from("promo_redemptions")
    .select(
      "id, slug, account_email, claimed_at, owner_user_id, claim_token_expires_at, benefit_type"
    )
    .eq("claim_token_digest", digest)
    .maybeSingle();

  if (error || !redemption) {
    return null;
  }

  const row = redemption as {
    id: string;
    slug: string;
    account_email: string;
    claimed_at: string | null;
    owner_user_id: string | null;
    claim_token_expires_at: string;
    benefit_type: string;
  };

  if (row.benefit_type !== "complimentary_lifetime") {
    return null;
  }

  const { data: profile } = await client
    .from("business_profiles")
    .select(
      "slug, plan, access_grant_type, access_grant_redemption_id, owner_user_id, stripe_customer_id, stripe_subscription_id"
    )
    .eq("slug", row.slug)
    .maybeSingle();

  const profileRow = profile as
    | {
        slug: string;
        plan: string | null;
        access_grant_type: string | null;
        access_grant_redemption_id: string | null;
        owner_user_id: string | null;
        stripe_customer_id: string | null;
        stripe_subscription_id: string | null;
      }
    | null;

  const grantOk = Boolean(
    profileRow &&
      profileRow.access_grant_redemption_id === row.id &&
      profileRow.access_grant_type === "complimentary_lifetime" &&
      String(profileRow.plan ?? "").toLowerCase() === "founder" &&
      !profileRow.stripe_customer_id &&
      !profileRow.stripe_subscription_id
  );

  return {
    redemptionId: row.id,
    slug: row.slug,
    accountEmail: row.account_email,
    claimedAt: row.claimed_at,
    ownerUserId: row.owner_user_id,
    expiresAt: row.claim_token_expires_at,
    grantOk,
  };
}

export async function consumePromoClaim(input: {
  claimTokenDigest: string;
  ownerUserId: string;
}): Promise<{
  ok: boolean;
  slug?: string;
  accountEmail?: string;
  alreadyClaimed?: boolean;
  reason?: string;
}> {
  const client = getServiceClient();
  const { data, error } = await client.rpc("credentials_ai_consume_promo_claim_v1", {
    p_claim_token_digest: input.claimTokenDigest.trim().toLowerCase(),
    p_owner_user_id: input.ownerUserId,
  });

  if (error) {
    const message = (error.message ?? "").toLowerCase();
    if (message.includes("claim_already_used")) {
      return { ok: false, reason: "claim_already_used" };
    }
    if (message.includes("claim_expired")) {
      return { ok: false, reason: "claim_expired" };
    }
    if (message.includes("different_owner")) {
      return { ok: false, reason: "different_owner" };
    }
    if (message.includes("claim_unavailable") || message.includes("invalid_claim")) {
      return { ok: false, reason: "claim_unavailable" };
    }
    if (message.includes("grant_mismatch") || message.includes("profile_not_eligible")) {
      return { ok: false, reason: "grant_mismatch" };
    }
    return { ok: false, reason: error.message || "consume_failed" };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    return { ok: false, reason: "empty_rpc_result" };
  }

  const result = row as {
    slug?: string;
    account_email?: string;
    already_claimed?: boolean;
  };

  if (!result.slug || !result.account_email) {
    return { ok: false, reason: "empty_rpc_result" };
  }

  return {
    ok: true,
    slug: result.slug,
    accountEmail: result.account_email,
    alreadyClaimed: Boolean(result.already_claimed),
  };
}

/**
 * Generate scanner-safe magic-link material for the exact stored account email,
 * then consume the claim token and attach ownership atomically via RPC.
 */
export async function completePromoClaimLogin(input: {
  claimToken: string;
}): Promise<
  | { ok: true; confirmUrl: string; slug: string }
  | { ok: false; reason: string; slug?: string; accountEmail?: string }
> {
  if (!isWellFormedClaimToken(input.claimToken)) {
    return { ok: false, reason: PROMO_GENERIC_UNAVAILABLE };
  }

  const claimTokenDigest = hashClaimToken(input.claimToken.trim());
  const lookup = await lookupPromoClaimByTokenDigest(claimTokenDigest);
  if (!lookup) {
    return { ok: false, reason: PROMO_GENERIC_UNAVAILABLE };
  }

  if (lookup.claimedAt) {
    return {
      ok: false,
      reason: PROMO_ALREADY_CLAIMED,
      slug: lookup.slug,
      accountEmail: lookup.accountEmail,
    };
  }

  if (new Date(lookup.expiresAt).getTime() <= Date.now()) {
    return { ok: false, reason: PROMO_GENERIC_UNAVAILABLE };
  }

  if (!lookup.grantOk) {
    return { ok: false, reason: PROMO_GENERIC_UNAVAILABLE };
  }

  const normalizedEmail = normalizeEmail(lookup.accountEmail);
  if (!normalizedEmail) {
    return { ok: false, reason: PROMO_GENERIC_UNAVAILABLE };
  }

  const authUser = await resolveOrCreatePromoAuthUser(normalizedEmail);
  const client = getServiceClient();
  const nextPath = `/dashboard/${lookup.slug}?welcome=promo`;

  const { data: linkData, error: linkErr } = await client.auth.admin.generateLink({
    type: "magiclink",
    email: normalizedEmail,
    options: {
      data: { created_via_promo: true, slug: lookup.slug },
    },
  });

  if (linkErr) {
    throw new Error(`generate_link_failed:${linkErr.message}`);
  }

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) {
    throw new Error("missing_magiclink_token_hash");
  }

  // Secure login material must exist before ownership/claim consumption.
  const consumed = await consumePromoClaim({
    claimTokenDigest,
    ownerUserId: authUser.id,
  });

  if (!consumed.ok) {
    if (
      consumed.reason === "claim_already_used" ||
      consumed.reason === "different_owner"
    ) {
      return {
        ok: false,
        reason: PROMO_ALREADY_CLAIMED,
        slug: lookup.slug,
        accountEmail: lookup.accountEmail,
      };
    }
    return { ok: false, reason: PROMO_GENERIC_UNAVAILABLE };
  }

  // Defense-in-depth: account email from RPC must still match stored email.
  const consumedEmail = normalizeEmail(consumed.accountEmail ?? null);
  if (
    !consumedEmail ||
    !safeEqualEmails(consumedEmail, normalizedEmail) ||
    consumed.slug !== lookup.slug
  ) {
    return { ok: false, reason: PROMO_GENERIC_UNAVAILABLE };
  }

  const confirmUrl = new URL("/auth/confirm", getSiteUrl());
  confirmUrl.searchParams.set("token_hash", tokenHash);
  confirmUrl.searchParams.set("next", nextPath);
  return { ok: true, confirmUrl: confirmUrl.toString(), slug: lookup.slug };
}

function safeEqualEmails(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function buildPromoStatusUrl(
  outcome: "unavailable" | "already_claimed",
  slug?: string
): string {
  const url = new URL("/promo/status", getSiteUrl());
  url.searchParams.set("outcome", outcome);
  if (slug && /^[a-z0-9-]{2,60}$/.test(slug)) {
    url.searchParams.set("slug", slug);
  }
  return url.toString();
}

export function buildPromoLoginUrl(slug: string): string {
  const params = new URLSearchParams();
  params.set("next", `/dashboard/${slug}`);
  params.set("source", "promo_claim_already_used");
  return `/auth/login?${params.toString()}`;
}
