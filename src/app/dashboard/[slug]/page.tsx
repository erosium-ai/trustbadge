// 🔑 Keywords: Credentials AI dashboard overview, Founding Member overview, setup checklist, proof snapshot, recent enquiries
// Founding Member dashboard v1 — overview page (Fable Five §5 wireframe).
// Modules in top-to-bottom order:
//   1. Header (business, live dot, founding number chip, profile URL)
//   2. Setup checklist (the spine)
//   3. This week proof snapshot (3 big-number tiles + top source)
//   4. Recent enquiries (last 5 leads)
//   5. Verification card (side col)
//   6. Founder support card (side col)
//   7. Billing card (side col)

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";
import {
  assertOwnership,
  getChecklistState,
  getProofSnapshot,
  getRecentLeads,
  prettySource,
} from "@/lib/dashboard-queries";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { formatAuDate } from "@/lib/date-format";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ welcome?: string }>;
}

// ---------------------------------------------------------------------------
// Small UI helpers
// ---------------------------------------------------------------------------

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`card-float rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function StatusChip({
  status,
}: {
  status: string;
}) {
  const map: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    not_started: {
      label: "Not started",
      dot: "bg-slate-400",
      bg: "bg-slate-50",
      text: "text-slate-700",
    },
    in_review: {
      label: "In review",
      dot: "bg-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-800",
    },
    verified: {
      label: "Verified",
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
    },
    action_needed: {
      label: "Action needed",
      dot: "bg-red-500",
      bg: "bg-red-50",
      text: "text-red-800",
    },
    expiring_soon: {
      label: "Expiring soon",
      dot: "bg-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-800",
    },
  };
  const s = map[status] ?? map.not_started;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatAuDate(iso);
}

function leadTypeLabel(type: string): string {
  switch (type) {
    case "call_click":
      return "Call tap";
    case "email_click":
      return "Email click";
    case "quote_form":
      return "Quote request";
    case "quote_form_open":
      return "Started a quote";
    default:
      return type;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardOverviewPage({
  params,
  searchParams,
}: DashboardPageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const justWelcomed = search?.welcome === "1";

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/dashboard/${slug}`);
  }

  const ownership = await assertOwnership(slug, user.id);
  if (!ownership.ok || !ownership.record) {
    redirect("/dashboard");
  }

  const record = ownership.record;
  const isFounding = record.plan === "founder" || record.founding_number != null;

  const [snapshot, leads, checklist] = await Promise.all([
    record.id
      ? getProofSnapshot(record.id, 7)
      : Promise.resolve({
          calls: 0,
          emailClicks: 0,
          quoteRequests: 0,
          topSource: null,
          totalEvents: 0,
          since: new Date().toISOString(),
        }),
    record.id ? getRecentLeads(record.id, 5) : Promise.resolve([]),
    record.id
      ? getChecklistState(record.id, record.verification_status)
      : Promise.resolve({
          profileLive: true,
          verificationStatus: record.verification_status,
          hasFirstLead: false,
          shareStepMarked: false,
        }),
  ]);

  const profileUrl = `https://credentialsai.com.au/b/${record.slug}`;

  const checklistSteps = [
    {
      done: checklist.profileLive,
      title: "Your profile is live",
      body: "Customers (and AI tools) can already read it.",
      cta: { label: "View profile", href: `/b/${record.slug}` },
    },
    {
      done: checklist.verificationStatus === "verified",
      title: "Get verified",
      body:
        checklist.verificationStatus === "in_review"
          ? "We're checking against official registers — usually 1–2 business days."
          : checklist.verificationStatus === "action_needed"
            ? "We need a couple of things — see verification for details."
            : "Send your ABN, licence and insurance. Most checks are done in 1–2 business days.",
      cta: {
        label: "Upload documents",
        href: `/dashboard/${record.slug}/verification`,
      },
      subCta: {
        label: "or email photos to support@erosium.ai",
        href: "mailto:support@erosium.ai",
      },
    },
    {
      done: checklist.shareStepMarked,
      title: "Put your profile to work",
      body:
        "Add your link to your Google Business Profile, email signature and quotes. That's where your next customer already looks.",
      cta: { label: "Copy my link", href: `#copy-link` },
    },
    {
      done: checklist.hasFirstLead,
      title: "First enquiry",
      body:
        "Ticks itself when your first call, email click or quote request comes through. You'll get an alert the moment it happens.",
      cta: null as { label: string; href: string } | null,
    },
  ];

  const doneCount = checklistSteps.filter((s) => s.done).length;
  const progressPct = Math.round((doneCount / checklistSteps.length) * 100);

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {justWelcomed ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            You&rsquo;re in. Payment received &mdash; your Verified Lead Engine is switched on.
          </div>
        ) : null}

        {/* 1. Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {record.business_name}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
              {isFounding ? (
                <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  Founding Member{record.founding_number ? ` #${record.founding_number}` : ""}
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="font-mono">{profileUrl}</span>
              <CopyLinkButton url={profileUrl} />
            </div>
          </div>
          <div>
            <Link
              href={`/b/${record.slug}`}
              target="_blank"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View my profile &rarr;
            </Link>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* 2. Setup checklist */}
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Get set up
                </h2>
                <span className="text-sm text-slate-500">
                  {doneCount} of {checklistSteps.length}
                </span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-[#F97316] transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <ul className="mt-5 space-y-4">
                {checklistSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        step.done
                          ? "bg-emerald-500 text-white"
                          : "border-2 border-slate-300 text-slate-400"
                      }`}
                    >
                      {step.done ? "✓" : ""}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          step.done ? "text-slate-500 line-through" : "text-slate-900"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {step.body}
                      </p>
                      {step.cta && !step.done ? (
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          {step.cta.href.startsWith("#") ? null : (
                            <Link
                              href={step.cta.href}
                              className="text-sm font-medium text-[#F97316] hover:underline"
                            >
                              {step.cta.label}
                            </Link>
                          )}
                          {"subCta" in step && step.subCta ? (
                            <Link
                              href={step.subCta.href}
                              className="text-xs text-slate-500 hover:underline"
                            >
                              {step.subCta.label}
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            {/* 3. Proof snapshot */}
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  This week
                </h2>
                <Link
                  href={`/dashboard/${record.slug}/leads`}
                  className="text-sm font-medium text-[#F97316] hover:underline"
                >
                  See all activity &rarr;
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <ProofTile label="Calls" value={snapshot.calls} />
                <ProofTile label="Email clicks" value={snapshot.emailClicks} />
                <ProofTile
                  label="Quote requests"
                  value={snapshot.quoteRequests}
                />
              </div>
              {snapshot.totalEvents === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  Counters are live &mdash; they only move when something real happens.
                </p>
              ) : (
                <p className="mt-4 text-sm text-slate-600">
                  Top source:{" "}
                  <span className="font-semibold text-slate-900">
                    {snapshot.topSource ?? "\u2014"}
                  </span>
                </p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                A &ldquo;call&rdquo; = someone tapped your number on your
                profile. We count the tap &mdash; we can&rsquo;t see if the
                call connected.
              </p>
            </Card>

            {/* 4. Recent enquiries */}
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent enquiries
                </h2>
                <Link
                  href={`/dashboard/${record.slug}/leads`}
                  className="text-sm font-medium text-[#F97316] hover:underline"
                >
                  All leads &rarr;
                </Link>
              </div>
              {leads.length === 0 ? (
                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  No enquiries yet &mdash; and we won&rsquo;t pretend
                  otherwise. These counters only move when something real
                  happens: a call tap, an email click, or a quote request on
                  your profile. While it&rsquo;s early, put your link where
                  customers already see you &mdash; your Google profile,
                  invoices, email signature. The moment something lands,
                  you&rsquo;ll know.
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <li
                      key={lead.id}
                      className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {lead.name ?? "(no name)"} &middot;{" "}
                          {leadTypeLabel(lead.type)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {timeAgo(lead.created_at)}
                          {lead.source
                            ? ` \u00b7 via ${prettySource(lead.source)}`
                            : null}
                        </p>
                      </div>
                      <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {lead.status ?? "new"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Side column */}
          <aside className="space-y-6">
            {/* 5. Verification card */}
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">
                  Verification
                </h3>
                <StatusChip status={record.verification_status} />
              </div>
              {record.verification_status === "not_started" ? (
                <p className="mt-3 text-sm text-slate-600">
                  Nothing submitted yet. Two ways &mdash; whichever&rsquo;s easier:
                </p>
              ) : record.verification_status === "in_review" ? (
                <p className="mt-3 text-sm text-slate-600">
                  We&rsquo;re checking against official registers &mdash;
                  usually 1&ndash;2 business days.
                </p>
              ) : record.verification_status === "verified" ? (
                <p className="mt-3 text-sm text-slate-600">
                  All set. We&rsquo;ll re-check before anything expires.
                </p>
              ) : record.verification_status === "action_needed" ? (
                <p className="mt-3 text-sm text-red-700">
                  We need a couple of things to complete verification.
                </p>
              ) : (
                <p className="mt-3 text-sm text-amber-800">
                  Something&rsquo;s expiring soon &mdash; please renew.
                </p>
              )}
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={`/dashboard/${record.slug}/verification`}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Upload documents
                </Link>
                <a
                  href="mailto:support@erosium.ai"
                  className="text-center text-xs text-slate-500 hover:underline"
                >
                  or email photos to support@erosium.ai
                </a>
              </div>
            </Card>

            {/* 6. Founder support */}
            <Card>
              <h3 className="text-base font-semibold text-slate-900">
                Set up with the founder
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Every Founding Member gets set up personally &mdash; profile,
                verification, the lot.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href="mailto:support@erosium.ai?subject=Founding%20Member%20setup"
                  className="w-full rounded-lg bg-[#F97316] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#EA580C]"
                >
                  Founder support
                </a>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                I read every message. &mdash; Ike, Credentials AI
              </p>
            </Card>

            {/* 7. Billing */}
            <Card>
              <h3 className="text-base font-semibold text-slate-900">
                Billing
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Founding Member &mdash; Verified Lead Engine
              </p>
              <p className="mt-1 text-sm text-slate-600">
                $49/month, locked in while you stay subscribed. Direct founder
                access included, no charge.
              </p>
              {record.next_payment_at ? (
                <p className="mt-2 text-sm text-slate-600">
                  Next payment:{" "}
                  <span className="font-medium text-slate-900">
                    {formatAuDate(record.next_payment_at)}
                  </span>
                </p>
              ) : null}
              <p className="mt-3 text-sm text-slate-500">
                Change card or cancel?{" "}
                <a
                  href="mailto:support@erosium.ai"
                  className="font-medium text-[#F97316] hover:underline"
                >
                  Email support@erosium.ai
                </a>{" "}
                &mdash; sorted within one business day.
              </p>
            </Card>
          </aside>
        </div>

        <footer className="mt-10 text-center text-sm text-slate-500">
          Stuck on anything? Email{" "}
          <a
            href="mailto:support@erosium.ai"
            className="font-medium text-[#F97316] hover:underline"
          >
            support@erosium.ai
          </a>{" "}
          or reply to any email we&rsquo;ve sent &mdash; a human answers,
          usually same day.
        </footer>
      </div>
    </main>
  );
}

function ProofTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-cream/70 p-4">
      <p
        className={`text-3xl font-black tabular-nums sm:text-4xl ${
          value > 0 ? "text-ink" : "text-slate-400"
        }`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className={`mt-2 h-0.5 w-8 rounded ${value > 0 ? "bg-sunset" : "bg-slate-200"}`} aria-hidden />
    </div>
  );
}


