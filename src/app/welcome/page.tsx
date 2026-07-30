// 🔑 Keywords: Credentials AI /welcome, Founding Member claim, Stripe session verify, post-checkout landing
// Post-checkout landing page. Verifies the Stripe Checkout Session server-side,
// upserts Founding Member state into business_profiles, and:
//   - auto-logs-in the paying user (no password needed), OR
//   - renders an account-claim form as fallback.
//
// Flow:
//   Stripe checkout → /welcome?session_id=cs_...
//   → upsert business state
//   → if user has no auth session: auto-create user + token → callback → dashboard
//   → if user is logged in + owner: dashboard directly

import { redirect } from "next/navigation";
import { getStripeClient } from "@/lib/stripe-server";
import { getServerClient } from "@/lib/supabase-server";
import { getServiceClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/brand";
import {
  attachOwnerIfMissing,
  normalizeEmail,
  upsertFoundingMember,
} from "@/lib/founding-member";
import { ClaimAccountForm } from "./ClaimAccountForm";

export const dynamic = "force-dynamic";

interface WelcomePageProps {
  searchParams: Promise<{ session_id?: string }>;
}

type SessionLike = {
  id: string;
  payment_status: string;
  customer: string | { id?: string } | null;
  subscription: string | { id?: string } | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  metadata?: Record<string, string> | null;
  amount_total?: number | null;
};

type SubscriptionLike = {
  status?: string;
  current_period_end?: number;
};

function toIdString(value: string | { id?: string } | null): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

// ---------------------------------------------------------------------------
// Auto-login: creates/gets a Supabase user for the Stripe email, generates a
// hashed one-time token via the admin API, then redirects to our server-side
// confirm route. The confirm route verifies the token and sets HttpOnly auth
// cookies. User lands on dashboard logged in — zero friction.
// ---------------------------------------------------------------------------

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

  // Supabase admin API does not currently provide an exact server-side email
  // lookup in this SDK, so we paginate until exhaustion. Keep a very high
  // defensive guard against broken nextPage loops without truncating normal
  // datasets.
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

  if (visitedPages.size >= MAX_PAGE_SCANS) {
    throw new Error("list_users_guard_exceeded");
  }

  return null;
}

async function resolveOrCreateAuthUserByEmail(
  email: string
): Promise<{ id: string; email: string }> {
  const client = getServiceClient();

  const existing = await findAuthUserByEmail(email);
  if (existing) return existing;

  const { data, error } = await client.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { created_via_checkout: true },
  });

  if (!error && data.user?.id) {
    return { id: data.user.id, email };
  }

  if (isDuplicateEmailError(error?.message)) {
    const raced = await findAuthUserByEmail(email);
    if (raced) return raced;
  }

  throw new Error(error?.message ?? "create_user_failed");
}

async function autoLogin(
  email: string,
  slug: string,
  businessProfileId: string,
): Promise<string> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("invalid_payment_email");
  }

  const client = getServiceClient();
  const authUser = await resolveOrCreateAuthUserByEmail(normalizedEmail);

  const nextPath = `/dashboard/${slug}?welcome=1`;
  const { data: linkData, error: linkErr } = await client.auth.admin.generateLink({
    type: "magiclink",
    email: normalizedEmail,
    options: {
      data: { created_via_checkout: true, slug },
    },
  });

  if (linkErr) {
    throw new Error(`generate_link_failed:${linkErr.message}`);
  }

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) {
    throw new Error("missing_magiclink_token_hash");
  }

  // Secure login material must exist before ownership is attached. If link
  // generation fails, recovery can retry without leaving a newly owned row
  // whose customer has no usable sign-in route.
  const attach = await attachOwnerIfMissing(
    businessProfileId,
    authUser.id,
    normalizedEmail
  );
  if (!attach.ok) {
    throw new Error(`owner_attach_failed:${attach.reason ?? "unknown"}`);
  }

  const confirmUrl = new URL("/auth/confirm", getSiteUrl());
  confirmUrl.searchParams.set("token_hash", tokenHash);
  confirmUrl.searchParams.set("next", nextPath);
  return confirmUrl.toString();
}

function buildExistingLoginUrl(slug: string, paymentEmail?: string | null): string {
  const params = new URLSearchParams();
  params.set("next", `/dashboard/${slug}`);
  params.set("source", "welcome_auto_login_failed");
  if (paymentEmail) {
    params.set("email", paymentEmail);
  }
  return `/auth/login?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const { session_id } = await searchParams;

  // No session id — hard fail with a friendly page.
  if (!session_id) {
    return <WelcomeFailure reason="missing_session" />;
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return <WelcomeFailure reason="stripe_not_configured" />;
  }

  let session: SessionLike | null = null;
  try {
    session = (await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["subscription", "customer"],
    })) as unknown as SessionLike;
  } catch {
    return <WelcomeFailure reason="session_not_found" />;
  }

  if (!session || session.payment_status !== "paid") {
    redirect("/pricing?checkout=incomplete");
  }

  const slug = session.metadata?.slug?.trim().toLowerCase();
  if (!slug) {
    return <WelcomeFailure reason="missing_slug" />;
  }

  const paymentEmail = normalizeEmail(
    session.customer_details?.email || session.customer_email || null
  );
  const customerId = toIdString(session.customer);
  const subscriptionId = toIdString(session.subscription);

  // Pull subscription for status + next_payment_at.
  let subscriptionStatus: string | null = null;
  let nextPaymentAt: string | null = null;
  if (subscriptionId) {
    try {
      const sub = (await stripe.subscriptions.retrieve(
        subscriptionId
      )) as unknown as SubscriptionLike;
      subscriptionStatus = sub.status ?? null;
      if (typeof sub.current_period_end === "number") {
        nextPaymentAt = new Date(sub.current_period_end * 1000).toISOString();
      }
    } catch {
      // best-effort; continue
    }
  }

  // Check current Supabase auth session on the server.
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authedEmail = normalizeEmail(user?.email ?? null);
  const canAttachAuthedUser =
    Boolean(user?.id) &&
    Boolean(paymentEmail) &&
    Boolean(authedEmail) &&
    paymentEmail === authedEmail;

  // Upsert paid membership state first. Ownership is attached separately via
  // the conditional helper so a concurrent claimant cannot be overwritten.
  const upsert = await upsertFoundingMember({
    slug,
    paymentEmail,
    customerId,
    subscriptionId,
    subscriptionStatus,
    nextPaymentAt,
    ownerUserId: null,
  });

  if (!upsert.ok || !upsert.record) {
    return (
      <WelcomeFailure
        reason={(upsert.reason ?? "").includes("profile_not_found") ? "profile_not_mirrored" : "upsert_failed"}
        paymentEmail={paymentEmail}
        slug={slug}
      />
    );
  }

  let record = upsert.record;

  if (canAttachAuthedUser && user) {
    const attach = await attachOwnerIfMissing(record.id, user.id, authedEmail);
    if (!attach.ok) {
      return (
        <WelcomeFailure
          reason={attach.reason === "different_owner" ? "different_owner" : "upsert_failed"}
          paymentEmail={paymentEmail}
          slug={slug}
        />
      );
    }
    record = { ...record, owner_user_id: user.id };
  }

  // ✅ AUTO-LOGIN: User is NOT logged in but we have their Stripe email.
  // Create/get their Supabase account, atomically attach owner, then route
  // through a one-time auth link callback.
  if (!user && paymentEmail) {
    let loginUrl: string;
    try {
      loginUrl = await autoLogin(paymentEmail, slug, record.id);
    } catch (err) {
      console.error("Auto-login failed, falling back to claim form:", err);
      const message = err instanceof Error ? err.message : "";
      if (message.includes("owner_attach_failed:different_owner")) {
        return (
          <WelcomeFailure
            reason="different_owner"
            paymentEmail={paymentEmail}
            slug={slug}
          />
        );
      }
      // Recovery path: direct customer to login where magic-link is available.
      redirect(buildExistingLoginUrl(slug, paymentEmail));
    }

    // Keep Next.js redirect control-flow outside the error boundary above.
    redirect(loginUrl);
  }

  // Case 1: Logged in and now the owner → dashboard.
  if (user && record.owner_user_id === user.id) {
    redirect(`/dashboard/${slug}?welcome=1`);
  }

  // Case 2: Logged in but the row has a different owner → tell them.
  if (user && record.owner_user_id && record.owner_user_id !== user.id) {
    return (
      <WelcomeFailure
        reason="different_owner"
        paymentEmail={paymentEmail}
        slug={slug}
      />
    );
  }

  // Case 3 (fallback): Not logged in and auto-login failed → render claim form.
  return (
    <WelcomeSuccess
      slug={slug}
      businessName={record.business_name}
      foundingNumber={record.founding_number ?? null}
      paymentEmail={paymentEmail}
      hasExistingOwner={Boolean(record.owner_user_id)}
    />
  );
}

// ---------------------------------------------------------------------------
// Success / claim view (Fable Five §13 copy verbatim)
// ---------------------------------------------------------------------------

function WelcomeSuccess({
  slug,
  businessName,
  foundingNumber,
  paymentEmail,
  hasExistingOwner,
}: {
  slug: string;
  businessName: string;
  foundingNumber: number | null;
  paymentEmail: string | null;
  hasExistingOwner: boolean;
}) {
  return (
    <main className="min-h-[70vh] bg-[#FAF7F2]">
      <div className="mx-auto max-w-xl px-6 py-14 sm:py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-xs font-medium uppercase tracking-widest text-[#F97316]">
            Payment received
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            You&rsquo;re in.{" "}
            {foundingNumber
              ? `AI-Ready Business Page secured.`
              : "AI-Ready Business Page secured."}
          </h1>
          <p className="mt-3 text-slate-700">
            Payment received &mdash; your AI-Ready Business Page is being
            switched on for{" "}
            <span className="font-semibold text-slate-900">{businessName}</span>.
          </p>
          <p className="mt-2 text-slate-700">
            {hasExistingOwner
              ? "One last step: we’ll send a secure magic link so you can open your dashboard instantly."
              : "One last step: set a password so you can get into your dashboard."}
          </p>

          <div className="mt-6">
            <ClaimAccountForm
              slug={slug}
              paymentEmail={paymentEmail}
              hasExistingOwner={hasExistingOwner}
            />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-slate-500">
            Receipt&rsquo;s on its way to your inbox. I&rsquo;ll also
            personally check your setup within one business day. &mdash; Ike,
            Credentials AI
          </p>
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Failure / edge-case view
// ---------------------------------------------------------------------------

function WelcomeFailure({
  reason,
  paymentEmail,
  slug,
}: {
  reason:
    | "missing_session"
    | "stripe_not_configured"
    | "session_not_found"
    | "missing_slug"
    | "upsert_failed"
    | "profile_not_mirrored"
    | "different_owner";
  paymentEmail?: string | null;
  slug?: string;
}) {
  const isDifferentOwner = reason === "different_owner";
  return (
    <main className="min-h-[70vh] bg-[#FAF7F2]">
      <div className="mx-auto max-w-xl px-6 py-14 sm:py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <h1 className="text-2xl font-bold text-slate-900">
            {isDifferentOwner
              ? "Almost there"
              : "We’ve got your payment"}
          </h1>
          <p className="mt-3 text-slate-700">
            {isDifferentOwner
              ? `This business (${slug}) already has an owner on Credentials AI. Email `
              : "Check your inbox within the hour — you should have a welcome from the founder. If not, email "}
            <a
              href="mailto:isaac@erosium.com.au"
              className="font-medium text-[#F97316] hover:underline"
            >
              isaac@erosium.com.au
            </a>{" "}
            and we&rsquo;ll sort it within one business day.
          </p>
          {paymentEmail ? (
            <p className="mt-4 text-sm text-slate-500">
              Payment on file for: {paymentEmail}
            </p>
          ) : null}
          <p className="mt-6 text-xs text-slate-400">Ref: {reason}</p>
        </div>
      </div>
    </main>
  );
}
