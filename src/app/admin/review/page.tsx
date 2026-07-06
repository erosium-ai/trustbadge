import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getPendingCredentialsForReview,
  setCredentialReviewStatus,
  type ReviewCredential,
} from "@/lib/trustbadge";
import { CREDENTIAL_LABELS } from "@/lib/types";
import { getCurrentAuthUser, isAdminUser } from "@/lib/admin-auth";

interface ReviewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

function formatSubmittedAt(value: string | undefined): string {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default async function AdminReviewPage({ searchParams }: ReviewPageProps) {
  await searchParams;

  const user = await getCurrentAuthUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!(await isAdminUser(user))) {
    notFound();
  }

  async function reviewAction(formData: FormData) {
    "use server";

    const actionUser = await getCurrentAuthUser();
    if (!actionUser || !(await isAdminUser(actionUser))) {
      throw new Error("Unauthorized review action");
    }

    const credentialId = String(formData.get("credentialId") ?? "");
    const expectedTrustbadgeId = String(formData.get("expectedTrustbadgeId") ?? "");
    const expectedCredentialType = String(formData.get("expectedCredentialType") ?? "");
    const expectedCreatedAt = String(formData.get("expectedCreatedAt") ?? "");
    const status = String(formData.get("status") ?? "");
    const adminNotes = String(formData.get("adminNotes") ?? "");

    if (!credentialId || (status !== "verified" && status !== "rejected")) {
      throw new Error("Invalid review payload");
    }

    const result = await setCredentialReviewStatus({
      credentialId,
      status,
      adminNotes,
      reviewerEmail: actionUser.email,
      expectedTrustbadgeId,
      expectedCredentialType,
      expectedCreatedAt,
    });

    if (!result.success) {
      throw new Error(result.error ?? "Review update failed");
    }

    revalidatePath("/admin/review");
    revalidatePath("/admin/review/history");
    revalidatePath("/badge/[slug]", "page");
    revalidatePath("/dashboard/[slug]", "page");
  }

  const pending = await getPendingCredentialsForReview();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">TrustBadge Review Queue</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pending credentials awaiting approve/reject action. Each action is locked to credential ID, badge ID, type, submitted time, and current pending state.
          </p>
          <Link
            href="/admin/review/history"
            className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            View review history
          </Link>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {pending.length} pending
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          No pending credentials right now.
        </div>
      ) : (
        <ul className="space-y-4">
          {pending.map((credential) => (
            <ReviewCard
              key={credential.id}
              credential={credential}
              action={reviewAction}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewCard({
  credential,
  action,
}: {
  credential: ReviewCredential;
  action: (formData: FormData) => Promise<void>;
}) {
  const badge = credential.trustbadge;
  const badgeSlug = badge?.slug ?? "unknown-slug";
  const businessName = badge?.business_name ?? "Unknown business";
  const credentialLabel = CREDENTIAL_LABELS[credential.type];
  const submittedAt = formatSubmittedAt(credential.created_at);
  const credentialShortId = shortId(credential.id);
  const badgeShortId = badge?.id ? shortId(badge.id) : "unknown";

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {businessName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {credentialLabel} · Submitted {submittedAt}
          </p>
          <div className="mt-3 grid gap-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-2">
            <p><span className="font-semibold text-slate-700">Credential:</span> {credentialShortId} ({credential.id})</p>
            <p><span className="font-semibold text-slate-700">Badge:</span> {badgeShortId} ({badgeSlug})</p>
            <p><span className="font-semibold text-slate-700">Type:</span> {credential.type}</p>
            <p><span className="font-semibold text-slate-700">Current status:</span> {credential.status}</p>
          </div>
          {badge?.slug && (
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <Link
                className="font-medium text-brand-600 hover:underline"
                href={`/badge/${badge.slug}`}
                target="_blank"
              >
                Open public badge
              </Link>
              <Link
                className="font-medium text-brand-600 hover:underline"
                href={`/dashboard/${badge.slug}`}
                target="_blank"
              >
                Open owner dashboard
              </Link>
            </div>
          )}
          {credential.file_url && (
            <a
              className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
              href={credential.file_url}
              target="_blank"
              rel="noreferrer"
            >
              View uploaded file
            </a>
          )}
        </div>
      </div>

      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="credentialId" value={credential.id} />
        <input type="hidden" name="expectedTrustbadgeId" value={credential.trustbadge_id} />
        <input type="hidden" name="expectedCredentialType" value={credential.type} />
        <input type="hidden" name="expectedCreatedAt" value={credential.created_at ?? ""} />

        <label className="block text-sm font-medium text-slate-700" htmlFor={`notes-${credential.id}`}>
          Decision note for {businessName} / {credentialLabel}
        </label>

        <textarea
          id={`notes-${credential.id}`}
          name="adminNotes"
          placeholder={`Optional admin notes for credential ${credentialShortId}`}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          rows={2}
        />

        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Action lock: this form can only update credential <span className="font-semibold">{credentialShortId}</span> while it is still pending and still attached to this badge/type. If another reviewer already acted, submit will fail safely.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="status"
            value="verified"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Approve this credential
          </button>
          <button
            type="submit"
            name="status"
            value="rejected"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reject this credential
          </button>
        </div>
      </form>
    </li>
  );
}
