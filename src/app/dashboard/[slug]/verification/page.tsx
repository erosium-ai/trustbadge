// 🔑 Keywords: Credentials AI verification tab, dashboard verification, credential upload
// Verification tab of the Founding Member dashboard. This is the old
// TrustBadge owner dashboard content, now mounted at
// /dashboard/[slug]/verification per Fable Five §4.

import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";
import { getOwnerTrustBadgeBySlug, getCredentialsForOwner } from "@/lib/trustbadge";
import { CredentialUpload } from "@/components/CredentialUpload";
import { TrustSeal } from "@/components/TrustSeal";
import Link from "next/link";
import { assertOwnership } from "@/lib/dashboard-queries";

export const dynamic = "force-dynamic";

interface VerificationPageProps {
  params: Promise<{ slug: string }>;
}

function statusLabel(status: string): string {
  switch (status) {
    case "verified":
      return "Verified";
    case "pending_review":
      return "In review";
    case "rejected":
      return "Action needed";
    case "suspended":
      return "Suspended";
    default:
      return "Not started";
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
  if (!ownership.ok) {
    redirect("/dashboard");
  }

  const trustbadge = await getOwnerTrustBadgeBySlug(slug, user.id);

  if (!trustbadge) {
    // Legacy TrustBadge row missing but user is legitimate business_profiles owner.
    // Show the empty-state upload flow (Lane A) and prompt for Lane B email.
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Verification</h1>
        <p className="mt-3 text-slate-600">
          Nothing submitted yet. Two ways &mdash; whichever&rsquo;s easier:
        </p>
        <ul className="mt-3 space-y-1 text-slate-700">
          <li>
            &bull; Upload documents here (once we&rsquo;ve provisioned your
            verification record).
          </li>
          <li>
            &bull; Or email photos of your licence and insurance to{" "}
            <a
              href="mailto:support@erosium.ai"
              className="font-medium text-[#F97316] hover:underline"
            >
              support@erosium.ai
            </a>
            .
          </li>
        </ul>
        <p className="mt-4 text-sm text-slate-500">
          We check against official registers and your badge goes live once
          everything&rsquo;s confirmed.
        </p>
      </div>
    );
  }

  const credentials = await getCredentialsForOwner(trustbadge.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification</h1>
          <p className="mt-1 text-slate-600">{trustbadge.business_name}</p>
          <p className="mt-1 text-slate-600">
            ABN: {trustbadge.abn || "\u2014"}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm">
            <span className="text-slate-500">Status:</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-800">
              {statusLabel(trustbadge.status)}
            </span>
          </p>
          {trustbadge.verification_summary && (
            <p className="mt-1 text-sm text-slate-500">
              {trustbadge.verification_summary}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <TrustSeal status={trustbadge.status} size="md" />
          <Link
            href={`/badge/${trustbadge.slug}`}
            className="text-sm font-medium text-[#F97316] hover:underline"
          >
            Public badge
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Prefer to send by email? Photos of your licence and insurance to{" "}
        <a
          href="mailto:support@erosium.ai"
          className="font-medium underline"
        >
          support@erosium.ai
        </a>{" "}
        &mdash; whichever&rsquo;s easier for you.
      </div>

      <div className="mt-8">
        <CredentialUpload
          trustbadgeId={trustbadge.id}
          initialCredentials={credentials}
        />
      </div>
    </div>
  );
}
