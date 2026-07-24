// 🔑 Keywords: Credentials AI ABN check tab, dashboard ABN status, ABR trust status
// ABN check tab of the dashboard, mounted at
// /dashboard/[slug]/verification. ABN/ABR-only: the legacy document upload
// flow (CredentialUpload) is intentionally not surfaced to customers anymore.

import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerClient } from "@/lib/supabase-server";
import { getOwnerTrustBadgeBySlug } from "@/lib/trustbadge";
import { TrustSeal } from "@/components/TrustSeal";
import { assertOwnership } from "@/lib/dashboard-queries";

export const dynamic = "force-dynamic";

interface VerificationPageProps {
  params: Promise<{ slug: string }>;
}

function statusLabel(status: string): string {
  switch (status) {
    case "verified":
      return "ABN checked";
    case "pending_review":
    case "in_review":
      return "In review";
    case "rejected":
    case "action_needed":
      return "Action needed";
    case "suspended":
      return "Paused";
    default:
      return "Not started";
  }
}

function statusExplainer(status: string): string {
  switch (status) {
    case "verified":
      return "Your ABN and business details match the Australian Business Register. We\u2019ll re-check them periodically to keep your trust wording accurate.";
    case "pending_review":
    case "in_review":
      return "We\u2019re checking your ABN against the Australian Business Register \u2014 usually 1\u20132 business days.";
    case "rejected":
    case "action_needed":
      return "There\u2019s a mismatch between your details and the Australian Business Register. Email support and we\u2019ll sort it with you.";
    case "suspended":
      return "Your ABN check is paused. Email support and we\u2019ll help you get it back on track.";
    default:
      return "Once your ABN is on file, we check your business name and details against official Australian Business Register data and show the result here.";
  }
}

export default async function VerificationPage({ params }: VerificationPageProps) {
  const { slug } = await params;

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/dashboard/${slug}/verification`);
  }

  const ownership = await assertOwnership(slug, user.id);
  if (!ownership.ok || !ownership.record) {
    redirect("/dashboard");
  }

  const record = ownership.record;
  const trustbadge = await getOwnerTrustBadgeBySlug(slug, user.id);

  const businessName = trustbadge?.business_name ?? record.business_name;
  const abn = (record.abn ?? trustbadge?.abn ?? "") || "";
  const hasAbn = abn.trim().length > 0;
  const status = trustbadge?.status ?? record.verification_status ?? "not_started";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ABN check</h1>
          <p className="mt-1 text-slate-600">{businessName}</p>
          <p className="mt-1 text-slate-600">
            ABN: {hasAbn ? abn : "\u2014"}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm">
            <span className="text-slate-500">Status:</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-800">
              {statusLabel(status)}
            </span>
          </p>
        </div>

        {trustbadge ? (
          <div className="flex flex-col items-center gap-2">
            <TrustSeal status={trustbadge.status} size="md" />
            <Link
              href={`/badge/${trustbadge.slug}`}
              className="text-sm font-medium text-[#F97316] hover:underline"
            >
              Public badge
            </Link>
          </div>
        ) : null}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">
          How your ABN check works
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          We check your ABN and business details against official Australian
          Business Register (ABR) data. When they match, your profile can show
          ABN-checked trust wording. We&rsquo;re independent &mdash; an ABN
          check is not a government endorsement.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {statusExplainer(status)}
        </p>
      </div>

      {hasAbn ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Need to update your ABN?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            If your ABN has changed or the details above look wrong, email{" "}
            <a
              href="mailto:support@erosium.ai?subject=Credentials%20AI%20ABN%20update"
              className="font-medium text-[#F97316] hover:underline"
            >
              support@erosium.ai
            </a>{" "}
            and we&rsquo;ll update it and re-run the check.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-amber-900">
            No ABN on file yet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-900">
            To get your business checked against the Australian Business
            Register, email your ABN to{" "}
            <a
              href="mailto:support@erosium.ai?subject=Credentials%20AI%20ABN%20check"
              className="font-medium underline"
            >
              support@erosium.ai
            </a>{" "}
            and we&rsquo;ll add it and run the check for you.
          </p>
        </div>
      )}

      <p className="mt-8 text-sm text-slate-500">
        <Link
          href={`/dashboard/${record.slug}`}
          className="font-medium text-[#F97316] hover:underline"
        >
          &larr; Back to dashboard
        </Link>
      </p>
    </div>
  );
}
