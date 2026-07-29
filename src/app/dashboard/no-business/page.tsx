// 🔑 Keywords: Credentials AI no business dashboard route, safe no-session-id destination
// Safe dashboard fallback for authenticated users without an owned business.

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function NoBusinessDashboardPage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard/no-business");
  }

  return (
    <main className="min-h-[70vh] bg-[#FAF7F2]">
      <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-xs font-medium uppercase tracking-widest text-[#F97316]">
            Dashboard setup
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            No business profile found for this account
          </h1>
          <p className="mt-3 text-slate-700">
            This login doesn&apos;t currently own a Credentials AI business profile.
            If you just purchased, use the welcome link from your checkout confirmation email.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="rounded-lg bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#EA580C]"
            >
              View plans
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Log in with a different account
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Need help? Email{" "}
            <a
              href="mailto:isaac@erosium.com.au"
              className="font-medium text-[#F97316] hover:underline"
            >
              isaac@erosium.com.au
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
