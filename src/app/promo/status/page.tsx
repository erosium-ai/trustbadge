// 🔑 Keywords: Credentials AI V2, Family GTM, promo status page, safe claim outcomes
// Plain, non-enumerating outcomes for failed or already-used promo claim links.

import Link from "next/link";

export const dynamic = "force-dynamic";

interface PromoStatusPageProps {
  searchParams: Promise<{ outcome?: string; slug?: string }>;
}

export default async function PromoStatusPage({ searchParams }: PromoStatusPageProps) {
  const params = await searchParams;
  const outcome = params.outcome === "already_claimed" ? "already_claimed" : "unavailable";
  const slug =
    typeof params.slug === "string" && /^[a-z0-9-]{2,60}$/.test(params.slug)
      ? params.slug
      : null;

  const title =
    outcome === "already_claimed"
      ? "This profile has already been claimed"
      : "This promo link is no longer available";

  const body =
    outcome === "already_claimed"
      ? "Sign in to continue to your dashboard. If you need help, email support."
      : "The link may have expired or already been used. If you need help, email support.";

  return (
    <main className="min-h-[70vh] bg-[#FAF7F2]">
      <div className="mx-auto max-w-xl px-6 py-14 sm:py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
            Promo link
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-3 text-slate-700">{body}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {outcome === "already_claimed" && slug ? (
              <Link
                href={`/auth/login?next=${encodeURIComponent(`/dashboard/${slug}`)}`}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Sign in to continue
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Sign in
              </Link>
            )}
            <a
              href="mailto:isaac@erosium.com.au"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Email isaac@erosium.com.au
            </a>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Support: isaac@erosium.com.au
          </p>
        </div>
      </div>
    </main>
  );
}
