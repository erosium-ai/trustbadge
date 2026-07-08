import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentAuthUser, isAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLandingPage() {
  const user = await getCurrentAuthUser();
  if (!user) redirect("/auth/login?next=/admin");
  if (!(await isAdminUser(user))) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
      <p className="mt-1 text-sm text-slate-600">
        Choose an admin area.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/admin/review"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-brand-300 transition"
        >
          <h2 className="text-lg font-semibold text-slate-900">Credential Review</h2>
          <p className="mt-2 text-sm text-slate-600">
            Approve or reject business credential uploads and review audit history.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
            Go to review →
          </span>
        </Link>

        <Link
          href="/admin/leads"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-brand-300 transition"
        >
          <h2 className="text-lg font-semibold text-slate-900">Lead Dashboard</h2>
          <p className="mt-2 text-sm text-slate-600">
            See SchemaPage free leads, filter, copy emails, and export to CSV for outreach.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
            Go to leads →
          </span>
        </Link>
      </div>
    </div>
  );
}
