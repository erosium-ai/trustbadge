// 🔑 Keywords: Credentials AI auth continue, magic link scanner protection, one-time token POST
// Email scanners commonly prefetch GET links. This page does not redeem the
// Supabase token. The one-time token is exchanged only after the customer
// explicitly presses the POST form button.

import { getSiteUrl } from "@/lib/brand";

export const dynamic = "force-dynamic";

interface ContinuePageProps {
  searchParams: Promise<{ token_hash?: string; next?: string }>;
}

function safeNextPath(value: string | undefined, origin: string): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /%(?:2f|5c)/i.test(value)
  ) {
    return "/dashboard";
  }

  try {
    const destination = new URL(value, origin);
    if (destination.origin !== origin) return "/dashboard";
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/dashboard";
  }
}

export default async function AuthContinuePage({
  searchParams,
}: ContinuePageProps) {
  const params = await searchParams;
  const origin = new URL(getSiteUrl()).origin;
  const tokenHash = params.token_hash?.trim() ?? "";
  const next = safeNextPath(params.next, origin);

  return (
    <main className="min-h-[70vh] bg-[#FAF7F2]">
      <div className="mx-auto max-w-md px-6 py-16 sm:py-24">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
            Secure sign-in
          </p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Continue to your dashboard
          </h1>
          <p className="mt-3 leading-relaxed text-slate-600">
            Your secure Credentials AI link is ready. Tap below to finish
            signing in on this device.
          </p>

          {tokenHash ? (
            <form action="/auth/confirm" method="post" className="mt-7">
              <input type="hidden" name="token_hash" value={tokenHash} />
              <input type="hidden" name="next" value={next} />
              <button
                type="submit"
                className="w-full rounded-lg bg-teal-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                Open my dashboard
              </button>
            </form>
          ) : (
            <div className="mt-7 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This link is incomplete. Return to the login page and request a
              new secure dashboard link.
            </div>
          )}

          <p className="mt-5 text-xs leading-relaxed text-slate-500">
            This extra confirmation protects one-time links from email security
            scanners opening them before you do.
          </p>
        </div>
      </div>
    </main>
  );
}
