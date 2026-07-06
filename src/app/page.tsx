import Link from "next/link";
import { BADGE_FEATURE_NAME, BRAND_NAME } from "@/lib/brand";

const TRUST_POINTS = [
  "Licences and registrations",
  "Insurance and compliance docs",
  "First aid and safety credentials",
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.15),transparent_70%)]" />

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            Credentials AI
            <span className="h-1 w-1 rounded-full bg-brand-500" />
            Trust signals that convert
          </p>

          <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Show customers they can trust you.
          </h1>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
            {BRAND_NAME} helps tradies and small businesses collect, verify, and
            publish licences, insurance, ABN, and safety credentials in one
            public, shareable {BADGE_FEATURE_NAME}.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition hover:-translate-y-0.5 hover:bg-brand-700"
            >
              Create your {BADGE_FEATURE_NAME}
            </Link>
            <Link
              href="/auth/login"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-5xl gap-4 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-700 shadow-sm"
            >
              <p className="font-semibold text-slate-900">{point}</p>
              <p className="mt-1 text-xs text-slate-500">
                Publicly visible, easy to share, and ready for customer checks.
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-brand-200/70 bg-white p-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            Built for fast trust decisions
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Your {BADGE_FEATURE_NAME} page gives customers one clean place to
            verify business credentials before they book.
          </p>
        </div>
      </section>
    </div>
  );
}
