import { notFound } from "next/navigation";
import { getPublicBadgeData } from "@/lib/trustbadge";
import { buildTrustBadgeSchema } from "@/lib/schema";
import { TrustSeal } from "@/components/TrustSeal";
import { getCredentialLabel, type Credential } from "@/lib/types";
import { BADGE_FEATURE_NAME, BRAND_NAME } from "@/lib/brand";
import { formatAuDateTime } from "@/lib/date-format";

export const dynamic = "force-dynamic";

interface BadgePageProps {
  params: Promise<{ slug: string }>;
}

const DEMO_BADGE_SLUG = "sample-plumbing-co";

function statusLabel(status: string): string {
  switch (status) {
    case "verified":
      return "Verified business";
    case "pending_review":
      return "Verification pending";
    case "rejected":
      return "Verification rejected";
    case "suspended":
      return "Badge suspended";
    default:
      return "Unverified badge";
  }
}

function confidenceLabel(level?: string | null): string {
  switch (level) {
    case "high":
      return "High confidence";
    case "medium":
      return "Medium confidence";
    case "low":
      return "Low confidence";
    default:
      return "Confidence pending";
  }
}

export default async function BadgePage({ params }: BadgePageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.trim().toLowerCase();
  const isDemoBadge = normalizedSlug === DEMO_BADGE_SLUG;

  let trustbadge: Awaited<ReturnType<typeof getPublicBadgeData>>["trustbadge"] | null = null;
  let credentials: Awaited<ReturnType<typeof getPublicBadgeData>>["credentials"] = [];

  if (!isDemoBadge) {
    const live = await getPublicBadgeData(slug);
    trustbadge = live.trustbadge;
    credentials = live.credentials;
    if (!trustbadge) {
      notFound();
    }
  }

  const demoBusinessName = "Coastal Plumbing Co";
  const demoLastChecked = "Demo timestamp";

  const effectiveTrustbadge = isDemoBadge
    ? {
        id: "demo-trustbadge-sample-plumbing-co",
        slug: DEMO_BADGE_SLUG,
        business_name: demoBusinessName,
        abn: null,
        status: "verified" as const,
        verification_confidence: "high" as const,
        verification_summary:
          "This is a demonstration preview only. No real ABN or live registry result is displayed on this page.",
        last_verified_at: null,
      }
    : trustbadge!;

  const effectiveVerified = isDemoBadge
    ? [
        {
          id: "demo-credential-abn",
          trustbadge_id: "demo-trustbadge-sample-plumbing-co",
          type: "abn",
          reference_number: "DEMO-ABN-CHECK",
          status: "verified" as const,
        },
        {
          id: "demo-credential-trade",
          trustbadge_id: "demo-trustbadge-sample-plumbing-co",
          type: "trade_license",
          reference_number: "DEMO-TRADE-CHECK",
          status: "verified" as const,
        },
      ]
    : credentials.filter((c: Credential) => c.status === "verified");

  const structured = buildTrustBadgeSchema(effectiveTrustbadge, effectiveVerified);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <TrustSeal status={effectiveTrustbadge.status} size="lg" />

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-900">
              {effectiveTrustbadge.business_name}
            </h1>
            <p className="mt-1 text-lg font-medium text-brand-700">
              {isDemoBadge ? "Demo verification preview" : statusLabel(effectiveTrustbadge.status)}
            </p>
            {isDemoBadge ? (
              <p className="mt-1 text-slate-600">ABN: Demo data only (not a real ABN record)</p>
            ) : effectiveTrustbadge.abn ? (
              <p className="mt-1 text-slate-600">ABN: {effectiveTrustbadge.abn}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-8">
          {(effectiveTrustbadge.verification_confidence || effectiveTrustbadge.verification_summary || effectiveTrustbadge.last_verified_at || isDemoBadge) && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Verification confidence</p>
              {effectiveTrustbadge.verification_confidence && (
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {confidenceLabel(effectiveTrustbadge.verification_confidence)}
                </p>
              )}
              {effectiveTrustbadge.verification_summary && (
                <p className="mt-1 text-sm text-slate-600">{effectiveTrustbadge.verification_summary}</p>
              )}
              {isDemoBadge ? (
                <p className="mt-1 text-xs text-slate-500">
                  Last checked: {demoLastChecked}
                </p>
              ) : effectiveTrustbadge.last_verified_at ? (
                <p className="mt-1 text-xs text-slate-500">
                  Last checked: {formatAuDateTime(effectiveTrustbadge.last_verified_at)}
                </p>
              ) : null}
              {isDemoBadge ? (
                <p className="mt-2 text-xs text-slate-500">
                  Your live verified badge will look like this, with your own ABN verification details below.
                </p>
              ) : null}
            </div>
          )}

          <h2 className="text-lg font-semibold text-slate-900">
            Verified credentials
          </h2>

          {effectiveVerified.length === 0 ? (
            <p className="mt-2 text-slate-600">
              No verified credentials yet. Check back soon.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {effectiveVerified.map((c: Credential) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className="font-medium text-slate-800">
                      {getCredentialLabel(c.type)}
                    </span>
                  </div>
                  {c.reference_number && (
                    <p className="ml-9 text-xs text-slate-500">
                      Ref: {c.reference_number}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            {isDemoBadge ? `Demo page by ${BRAND_NAME} · ${BADGE_FEATURE_NAME}` : `Verified by ${BRAND_NAME} · ${BADGE_FEATURE_NAME}`}
          </p>
          {isDemoBadge ? (
            <p className="mt-1 text-xs text-slate-400">Live customer pages show real verified business data.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
