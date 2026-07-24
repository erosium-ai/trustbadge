// 🔑 Keywords: Credentials AI billing portal, Stripe customer portal, cancel plan, manage subscription
import { NextRequest, NextResponse } from "next/server";
import { assertOwnership } from "@/lib/dashboard-queries";
import { getServerClient } from "@/lib/supabase-server";
import { getStripeClient } from "@/lib/stripe-server";
import { getSiteUrl } from "@/lib/brand";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const siteUrl = getSiteUrl();
  const slug = request.nextUrl.searchParams.get("slug")?.trim().toLowerCase();

  if (!slug) {
    return NextResponse.redirect(`${siteUrl}/dashboard?billing=missing_slug`);
  }

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${siteUrl}/auth/login?next=${encodeURIComponent(`/api/billing-portal?slug=${slug}`)}`
    );
  }

  const ownership = await assertOwnership(slug, user.id);
  if (!ownership.ok || !ownership.record) {
    return NextResponse.redirect(`${siteUrl}/dashboard`);
  }

  const record = ownership.record;
  if (!record.stripe_customer_id) {
    return NextResponse.redirect(
      `${siteUrl}/dashboard/${record.slug}?billing=missing_customer`
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.redirect(
      `${siteUrl}/dashboard/${record.slug}?billing=not_configured`
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: record.stripe_customer_id,
      return_url: `${siteUrl}/dashboard/${record.slug}`,
      configuration: process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID || undefined,
    });

    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("billing_portal_session_failed", error);
    return NextResponse.redirect(
      `${siteUrl}/dashboard/${record.slug}?billing=portal_error`
    );
  }
}
