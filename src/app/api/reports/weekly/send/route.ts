/* 🔑 Keywords: Credentials AI weekly report sender, customer lead summary email, CRON_SECRET, weekly proof summary */

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { prettySource } from "@/lib/dashboard-queries";

export const dynamic = "force-dynamic";

type BusinessProfileRow = {
  id: string;
  slug: string;
  business_name: string;
  owner_user_id: string | null;
  payment_email: string | null;
  email: string | null;
  plan: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  metadata: Record<string, unknown> | null;
};

type LeadRow = {
  id: string;
  type: string;
  source: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  service_needed: string | null;
  status: string;
  created_at: string;
};

type WeeklyStats = {
  totalEvents: number;
  quoteForms: number;
  callClicks: number;
  emailClicks: number;
  topSource: string | null;
  newestLeadAt: string | null;
  newStatus: number;
  recentQuotes: LeadRow[];
};

function dedupeEmails(emails: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const email of emails) {
    const normalized = email?.trim().toLowerCase();
    if (!normalized || !normalized.includes("@") || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

function isPaidProfile(profile: BusinessProfileRow): boolean {
  const plan = String(profile.plan ?? "").toLowerCase();
  const status = String(profile.subscription_status ?? "").toLowerCase();
  return Boolean(
    profile.stripe_customer_id ||
      profile.stripe_subscription_id ||
      ["founder", "founding_member", "founding", "pro", "paid", "verified_lead_engine"].includes(plan) ||
      ["active", "trialing", "past_due", "unpaid"].includes(status)
  );
}

function getPeriodKey(now = new Date()): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // ISO week-ish Monday key in Brisbane-safe UTC date form. Good enough for idempotency.
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function formatAuDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-AU", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Australia/Brisbane",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function getDashboardUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://credentialsai.com.au";
  const next = `/dashboard/${slug}`;
  return `${base}/auth/login?next=${encodeURIComponent(next)}`;
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CREDENTIALS_AI_REPORT_SECRET || process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  const querySecret = request.nextUrl.searchParams.get("secret") || "";
  return bearer === secret || querySecret === secret;
}

async function getOwnerEmails(profile: BusinessProfileRow): Promise<string[]> {
  const service = getServiceClient();
  let authEmail: string | null = null;
  if (profile.owner_user_id) {
    const { data, error } = await service.auth.admin.getUserById(profile.owner_user_id);
    if (!error && data?.user?.email) authEmail = data.user.email;
  }
  return dedupeEmails([authEmail, profile.payment_email, profile.email]).slice(0, 1);
}

async function fetchWeeklyStats(profileId: string, sinceIso: string): Promise<WeeklyStats> {
  const service = getServiceClient();
  const { data, error } = await service
    .from("lead_events")
    .select("id,type,source,name,phone,email,service_needed,status,created_at")
    .eq("business_profile_id", profileId)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return {
      totalEvents: 0,
      quoteForms: 0,
      callClicks: 0,
      emailClicks: 0,
      topSource: null,
      newestLeadAt: null,
      newStatus: 0,
      recentQuotes: [],
    };
  }

  const rows = data as unknown as LeadRow[];
  const sourceCounts = new Map<string, number>();
  for (const row of rows) {
    const src = prettySource(row.source);
    sourceCounts.set(src, (sourceCounts.get(src) ?? 0) + 1);
  }

  let topSource: string | null = null;
  let topCount = 0;
  for (const [src, count] of sourceCounts) {
    if (count > topCount) {
      topSource = src;
      topCount = count;
    }
  }

  return {
    totalEvents: rows.length,
    quoteForms: rows.filter((row) => row.type === "quote_form").length,
    callClicks: rows.filter((row) => row.type === "call_click").length,
    emailClicks: rows.filter((row) => row.type === "email_click").length,
    topSource,
    newestLeadAt: rows[0]?.created_at ?? null,
    newStatus: rows.filter((row) => row.status === "new").length,
    recentQuotes: rows.filter((row) => row.type === "quote_form").slice(0, 3),
  };
}

function buildWeeklyReportEmail(params: {
  businessName: string;
  slug: string;
  sinceIso: string;
  untilIso: string;
  stats: WeeklyStats;
}): string {
  const dashboardUrl = getDashboardUrl(params.slug);
  const { stats } = params;
  const lines = [
    `Your weekly Credentials AI lead summary for ${params.businessName}.`,
    "",
    `Period: ${formatAuDateTime(params.sinceIso)} to ${formatAuDateTime(params.untilIso)} AEST`,
    "",
    "This week through your Credentials AI profile:",
    `Quote requests: ${stats.quoteForms}`,
    `Call taps: ${stats.callClicks}`,
    `Email clicks: ${stats.emailClicks}`,
    `Total tracked events: ${stats.totalEvents}`,
    `Top source: ${stats.topSource || "No source data yet"}`,
    `New leads waiting: ${stats.newStatus}`,
    `Latest activity: ${formatAuDateTime(stats.newestLeadAt)}`,
    "",
  ];

  if (stats.recentQuotes.length > 0) {
    lines.push("Recent quote enquiries:", "");
    for (const lead of stats.recentQuotes) {
      lines.push(
        `- ${lead.name || "(no name)"} · ${lead.service_needed || "Service not specified"} · ${formatAuDateTime(lead.created_at)}`,
        `  Phone: ${lead.phone || "(not provided)"}`,
        `  Email: ${lead.email || "(not provided)"}`,
        ""
      );
    }
  } else {
    lines.push(
      "No quote enquiries landed this week. That is still useful: your report stays honest and only counts real activity.",
      ""
    );
  }

  lines.push(
    "View your dashboard:",
    dashboardUrl,
    "",
    "Credentials AI tracks activity that happens through your profile. It does not guess off-platform calls, word-of-mouth jobs, or enquiries that bypass your profile link."
  );

  return lines.join("\n");
}

async function sendWeeklyEmail(params: {
  recipients: string[];
  businessName: string;
  text: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || params.recipients.length === 0) return false;

  const from =
    process.env.CREDENTIALS_AI_REPORT_FROM ||
    process.env.CREDENTIALS_AI_LEAD_NOTIFY_FROM ||
    "Credentials AI <notifications@erosium.com.au>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "User-Agent": "credentials-ai-weekly-reporter/1.0",
    },
    body: JSON.stringify({
      from,
      to: params.recipients,
      subject: `Your weekly Credentials AI lead summary — ${params.businessName}`,
      text: params.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend request failed: ${response.status} ${body.slice(0, 240)}`);
  }

  return true;
}

async function sendWeeklyReports(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
  const force = request.nextUrl.searchParams.get("force") === "1";
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") || "100") || 100, 250);
  const now = new Date();
  const since = new Date(now);
  since.setDate(since.getDate() - 7);
  const sinceIso = since.toISOString();
  const untilIso = now.toISOString();
  const periodKey = request.nextUrl.searchParams.get("period") || getPeriodKey(now);

  const service = getServiceClient();
  const { data, error } = await service
    .from("business_profiles")
    .select("id,slug,business_name,owner_user_id,payment_email,email,plan,subscription_status,stripe_customer_id,stripe_subscription_id,metadata")
    .eq("status", "active")
    .limit(limit);

  if (error || !data) {
    return NextResponse.json({ ok: false, error: error?.message || "profiles_query_failed" }, { status: 500 });
  }

  const profiles = (data as unknown as BusinessProfileRow[]).filter(isPaidProfile);
  const results: Array<{
    slug: string;
    sent: boolean;
    skipped?: string;
    recipients?: number;
    totalEvents?: number;
  }> = [];

  for (const profile of profiles) {
    const metadata = profile.metadata ?? {};
    const weeklyReports = (metadata.weekly_reports ?? {}) as Record<string, unknown>;
    if (!force && weeklyReports.last_sent_period === periodKey) {
      results.push({ slug: profile.slug, sent: false, skipped: "already_sent" });
      continue;
    }

    const recipients = await getOwnerEmails(profile);
    if (recipients.length === 0) {
      results.push({ slug: profile.slug, sent: false, skipped: "no_recipient" });
      continue;
    }

    const stats = await fetchWeeklyStats(profile.id, sinceIso);
    const text = buildWeeklyReportEmail({
      businessName: profile.business_name,
      slug: profile.slug,
      sinceIso,
      untilIso,
      stats,
    });

    if (!dryRun) {
      await sendWeeklyEmail({ recipients, businessName: profile.business_name, text });
      const nextMetadata = {
        ...metadata,
        weekly_reports: {
          ...weeklyReports,
          last_sent_period: periodKey,
          last_sent_at: now.toISOString(),
          last_sent_to_count: recipients.length,
        },
      };
      await service.from("business_profiles").update({ metadata: nextMetadata }).eq("id", profile.id);
    }

    results.push({
      slug: profile.slug,
      sent: !dryRun,
      skipped: dryRun ? "dry_run" : undefined,
      recipients: recipients.length,
      totalEvents: stats.totalEvents,
    });
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    force,
    periodKey,
    checkedProfiles: data.length,
    eligibleProfiles: profiles.length,
    results,
  });
}

export async function GET(request: NextRequest) {
  return sendWeeklyReports(request);
}

export async function POST(request: NextRequest) {
  return sendWeeklyReports(request);
}
