// 🔑 Keywords: Credentials AI /welcome, Founding Member claim, Stripe session verify, post-checkout landing
// Post-checkout landing page. Verifies the Stripe Checkout Session server-side,
// upserts Founding Member state into business_profiles, and either:
//   - attaches the current logged-in user as owner (if session exists), OR
//   - renders an account-claim form (email prefilled+locked, password field).
//
// Spec: Fable Five §3 + §13 (verbatim copy) in CREDENTIALS_AI_FOUNDER_DASHBOARD_SPEC_FABLE_FIVE_2026-07-09.md

import { redirect } from "next/navigation";
import { getStripeClient } from "@/lib/stripe-server";
import { getServerClient } from "@/lib/supabase-server";
import {
  attachOwnerIfMissing,
  getFoundingMemberBySlug,
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

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const { session_id } = await searchParams;

  // No session id — hard fail with a friendly page (do not silently redirect).
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
    // Payment did not complete — send them back to pricing but do not error.
    redirect("/pricing?checkout=incomplete");
  }

  const slug = session.metadata?.slug?.trim().toLowerCase();
  if (!slug) {
    return <WelcomeFailure reason="missing_slug" />;
  }

  const paymentEmail =
    session.customer_details?.email || session.customer_email || null;
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

  // Upsert Founding Member state, attaching owner if user is logged in and
  // the row has no owner yet.
  const upsert = await upsertFoundingMember({
    slug,
    paymentEmail,
    customerId,
    subscriptionId,
    subscriptionStatus,
    nextPaymentAt,
    ownerUserId: user?.id ?? null,
  });

  if (!upsert.ok || !upsert.record) {
    // Could not find business_profiles row — this usually means the profile
    // was created only in the SchemaPage `pages` table and has not been
    // mirrored yet. Fall back to the friendly "we've got your payment" page,
    // which alerts the founder for manual provisioning.
    return (
      <WelcomeFailure
        reason={upsert.reason === "profile_not_found" ? "profile_not_mirrored" : "upsert_failed"}
        paymentEmail={paymentEmail}
        slug={slug}
      />
    );
  }

  const record = upsert.record;

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

  // Case 3: Not logged in → render account-claim form.
  // If ownership was somehow already attached (e.g. previous visit), still
  // let them log in normally.
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
              ? `Founding Member #${foundingNumber}.`
              : "Founding Member secured."}
          </h1>
          <p className="mt-3 text-slate-700">
            Payment received &mdash; your Verified Lead Engine is being
            switched on for{" "}
            <span className="font-semibold text-slate-900">{businessName}</span>.
          </p>
          <p className="mt-2 text-slate-700">
            One last step: set a password so you can get into your dashboard.
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
              : "We\u2019ve got your payment"}
          </h1>
          <p className="mt-3 text-slate-700">
            {isDifferentOwner
              ? `This business (${slug}) already has an owner on Credentials AI. Email `
              : "Check your inbox within the hour \u2014 you should have a welcome from the founder. If not, email "}
            <a
              href="mailto:support@erosium.ai"
              className="font-medium text-[#F97316] hover:underline"
            >
              support@erosium.ai
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
