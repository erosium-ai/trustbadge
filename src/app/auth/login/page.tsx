"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { BADGE_FEATURE_NAME } from "@/lib/brand";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function safeNextPath(): string | null {
    if (typeof window === "undefined") return null;

    const next = new URLSearchParams(window.location.search).get("next");
    if (!next) return null;
    if (!next.startsWith("/")) return null;
    if (next.startsWith("//")) return null;
    return next;
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getBrowserClient();

    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    const nextPath = safeNextPath();
    if (nextPath) {
      callbackUrl.searchParams.set("next", nextPath);
    }

    const { error: linkError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    if (linkError) {
      setError(linkError?.message ?? "Failed to send magic link");
      setLoading(false);
      return;
    }

    setError(null);
    setMessage("Magic link sent! Check your inbox and click the link to log in.");
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getBrowserClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError(authError?.message ?? "Login failed");
      setLoading(false);
      return;
    }

    type BadgeSlugRow = { slug: string };
    const { data: badgeData } = await supabase
      .from("trustbadges")
      .select("slug")
      .eq("user_id", data.user.id)
      .single<BadgeSlugRow>();

    const nextPath = safeNextPath();
    if (nextPath) {
      router.push(nextPath);
      return;
    }

    if (badgeData?.slug) {
      router.push(`/dashboard/${badgeData.slug}`);
      return;
    }

    router.push("/auth/register");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
      <p className="mt-2 text-slate-600">
        Access your {BADGE_FEATURE_NAME} dashboard.
      </p>

      <form onSubmit={handleMagicLink} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-teal-600 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send magic link"}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-200 pt-6">
        <p className="text-center text-sm font-medium text-slate-700">
          Or log in with password
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        No account?{" "}
        <Link href="/auth/register" className="font-medium text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
