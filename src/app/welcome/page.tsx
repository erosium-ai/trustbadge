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
import { cookies } from "next/headers";
import { getStripeClient } from "@/lib/stripe-server";
import { getServerClient } from "@/lib/supabase-server";
import {
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
// token via admin API, then redirects to the auth callback which exchanges the
// token server-side and sets HttpOnly cookies. User lands on dashboard logged
// in — zero friction.
// ---------------------------------------------------------------------------

async function autoLogin(
  email: string,
  slug: string,
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  }

  // Step 1: Look up or create user
  let userId: string;
  try {
    const listResp = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?per_page=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `***${serviceKey}`,
        },
      }
    );

    if (!listResp.ok) throw new Error(`List users failed: ${listResp.status}`);

    const listData = await listResp.json();
    const users = listData.users || [];

    // GoTrue admin list doesn't support email filter in query params.
    // We need to search manually. For now, always create — GoTrue upserts by email.
    // Actually we can use the GET with a filter. Let's just always create.
    // createUser with email_confirm:true will return existing user if email taken.
  } catch {
    // fall through to create
  }

  // Step 2: Create or get user (GoTrue returns 422 if email exists, but we'd
  // rather not rely on error codes for control flow)
  // Instead: generate_link directly — it works even if user doesn't exist yet
  // as long as the email identity exists.
  
  // Actually the cleanest path: always create the user. If exists, GoTrue
  // returns 422 — catch that and proceed with generate_link anyway.
  try {
    const createResp = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `***${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        email_confirm: true,
        user_metadata: { created_via_checkout: true },
      }),
    });
    if (createResp.ok) {
      const created = await createResp.json();
      userId = created.id;
    }
    // 422 = already exists, that's fine
  } catch {
    // best-effort
  }

  // Step 3: Generate magic link token via admin API (bypasses rate limits)
  const linkResp = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `***${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "magiclink",
      email,
      options: {
        redirect_to: `https://credentialsai.com.au/auth/callback?next=/dashboard/${slug}%3Fwelcome%3D1`,
      },
    }),
  });

  if (!linkResp.ok) {
    const errBody = await linkResp.text();
    throw new Error(`generate_link failed: ${linkResp.status} — ${errBody}`);
  }

  const linkData = await linkResp.json();
  const token = linkData.hashed_token;

  if (!token) {
    throw new Error("No token in generate_link response");
  }

  // Step 4: Redirect to the verify endpoint which will set the session
  // and then redirect to our callback → dashboard
  const verifyUrl =
    `${supabaseUrl}/auth/v1/verify` +
    `?token=***{encodeURIComponent(token)}` +
    `&type=magiclink` +
    `&redirect_to=${encodeURIComponent(`https://credentialsai.com.au/auth/callback?next=/dashboard/${slug}%3Fwelcome%3D1`)}`;

  return verifyUrl;
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

  // Upsert Founding Member state, attaching owner if user is logged in.
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
    return (
      <WelcomeFailure
        reason={upsert.reason === "profile_not_found" ? "profile_not_mirrored" : "upsert_failed"}
        paymentEmail={paymentEmail}
        slug={slug}
      />
    );
  }

  const record = upsert.record;

  // ✅ AUTO-LOGIN: User is NOT logged in but we have their Stripe email.
  // Create/get their Supabase account and log them in automatically.
  if (!user && paymentEmail) {
    try {
      const loginUrl = await autoLogin(paymentEmail, slug);
      redirect(loginUrl);
    } catch (err) {
      console.error("Auto-login failed, falling back to claim form:", err);
      // Fall through to claim form below
    }
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
