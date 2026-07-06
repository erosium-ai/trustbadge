import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Show customers they can trust you.
      </h1>
      <p className="mt-6 text-lg text-slate-600">
        TrustBadge helps tradies and small businesses collect, verify, and
        display their licenses, insurance, ABN, police checks, and first aid
        certificates in one public, shareable badge.
      </p>
      <div className="mt-10 flex items-center justify-center gap-4">
        <Link
          href="/auth/register"
          className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Create your badge
        </Link>
        <Link
          href="/auth/login"
          className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
