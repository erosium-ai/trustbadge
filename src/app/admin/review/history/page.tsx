import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentAuthUser, isAdminEmail } from "@/lib/admin-auth";
import { CREDENTIAL_LABELS } from "@/lib/types";
import { getReviewHistory } from "@/lib/trustbadge";

export const dynamic = "force-dynamic";

export default async function ReviewHistoryPage() {
  const user = await getCurrentAuthUser();

  if (!user) {
    redirect("/auth/login?next=/admin/review/history");
  }

  if (!isAdminEmail(user.email)) {
    notFound();
  }

  const history = await getReviewHistory(100);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review activity history</h1>
          <p className="mt-1 text-sm text-slate-600">
            Audit trail for recent credential decisions.
          </p>
        </div>
        <Link
          href="/admin/review"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to queue
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          No review activity recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">When</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Business</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Credential</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Decision</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Reviewer</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item) => {
                const decisionStyle =
                  item.decision === "verified"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800";

                return (
                  <tr key={item.credential.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {new Date(item.reviewedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      <div className="font-medium">
                        {item.trustbadge?.business_name ?? "Unknown business"}
                      </div>
                      {item.trustbadge?.slug && (
                        <Link
                          href={`/badge/${item.trustbadge.slug}`}
                          target="_blank"
                          className="text-xs text-brand-600 hover:underline"
                        >
                          /badge/{item.trustbadge.slug}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {CREDENTIAL_LABELS[item.credential.type]}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${decisionStyle}`}>
                        {item.decision === "verified" ? "Approved" : "Rejected"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.reviewerEmail ?? "Unknown"}
                    </td>
                    <td className="max-w-sm px-4 py-3 text-slate-700">
                      <span className="line-clamp-3">{item.note ?? "—"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
