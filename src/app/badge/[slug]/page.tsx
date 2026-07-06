import { notFound } from "next/navigation";
import { getPublicBadgeData } from "@/lib/trustbadge";
import { buildTrustBadgeSchema } from "@/lib/schema";
import { TrustSeal } from "@/components/TrustSeal";
import { CREDENTIAL_LABELS, type Credential } from "@/lib/types";

export const dynamic = "force-dynamic";

interface BadgePageProps {
  params: Promise<{ slug: string }>;
}

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

export default async function BadgePage({ params }: BadgePageProps) {
  const { slug } = await params;
  const { trustbadge, credentials } = await getPublicBadgeData(slug);

  if (!trustbadge) {
    notFound();
  }

  const verified = credentials.filter((c: Credential) => c.status === "verified");
  const structured = buildTrustBadgeSchema(trustbadge, verified);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <TrustSeal status={trustbadge.status} size="lg" />

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-900">
              {trustbadge.business_name}
            </h1>
            <p className="mt-1 text-lg font-medium text-brand-700">
              {statusLabel(trustbadge.status)}
            </p>
            {trustbadge.abn && (
              <p className="mt-1 text-slate-600">ABN: {trustbadge.abn}</p>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Verified credentials
          </h2>

          {verified.length === 0 ? (
            <p className="mt-2 text-slate-600">
              No verified credentials yet. Check back soon.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {verified.map((c: Credential) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
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
                    {CREDENTIAL_LABELS[c.type]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Verified by TrustBadge · trustbadge.io
          </p>
        </div>
      </div>
    </div>
  );
}
