import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";
import { getOwnerTrustBadgeBySlug, getCredentialsForOwner } from "@/lib/trustbadge";
import { CredentialUpload } from "@/components/CredentialUpload";
import { TrustSeal } from "@/components/TrustSeal";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  params: Promise<{ slug: string }>;
}

function statusLabel(status: string): string {
  switch (status) {
    case "verified":
      return "Verified";
    case "pending_review":
      return "Pending review";
    case "rejected":
      return "Rejected";
    case "suspended":
      return "Suspended";
    default:
      return "Draft";
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

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params;

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const trustbadge = await getOwnerTrustBadgeBySlug(slug, user.id);
  if (!trustbadge) {
    redirect("/auth/register");
  }

  const credentials = await getCredentialsForOwner(trustbadge.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {trustbadge.business_name}
          </h1>
          <p className="mt-1 text-slate-600">ABN: {trustbadge.abn || "—"}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm">
            <span className="text-slate-500">Status:</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-800">
              {statusLabel(trustbadge.status)}
            </span>
          </p>
          {trustbadge.verification_confidence && (
            <p className="mt-2 text-sm text-slate-600">
              Verification confidence: <span className="font-medium text-slate-900">{confidenceLabel(trustbadge.verification_confidence)}</span>
            </p>
          )}
          {trustbadge.verification_summary && (
            <p className="mt-1 text-sm text-slate-500">{trustbadge.verification_summary}</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <TrustSeal status={trustbadge.status} size="md" />
          <Link
            href={`/badge/${trustbadge.slug}`}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Public badge
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <CredentialUpload
          trustbadgeId={trustbadge.id}
          initialCredentials={credentials}
        />
      </div>
    </div>
  );
}
