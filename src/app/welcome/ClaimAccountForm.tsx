"use client";

// 🔑 Keywords: Credentials AI claim account form, welcome password, founding member signup
// Client component for the /welcome flow. Prefills email (locked to payment
// email) and lets the customer set a password. Uses Supabase signUp; on
// success, the /welcome flow's server-side upsert has already reserved the
// founding_number, so the callback simply attaches ownership and redirects
// to /dashboard/[slug].

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";

interface ClaimAccountFormProps {
  slug: string;
  paymentEmail: string | null;
  hasExistingOwner: boolean;
}

export function ClaimAccountForm({
  slug,
  paymentEmail,
  hasExistingOwner,
}: ClaimAccountFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(paymentEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getBrowserClient();
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError || !data.user) {
        setError(signUpError?.message ?? "Could not create your account");
        setLoading(false);
        return;
      }

      // Attach ownership server-side.
      const attach = await fetch("/api/founding/attach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, userId: data.user.id }),
      });
      if (!attach.ok) {
        const body = await attach.json().catch(() => ({}));
        setError(body?.error ?? "Could not attach your business");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/${slug}?welcome=1`);
    } catch (err) {
      setError((err as Error).message ?? "Unexpected error");
      setLoading(false);
    }
  }

  async function handleLoginInstead(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = getBrowserClient();
    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authErr || !data.user) {
      setError(authErr?.message ?? "Login failed");
      setLoading(false);
      return;
    }
    const attach = await fetch("/api/founding/attach", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, userId: data.user.id }),
    });
    if (!attach.ok) {
      const body = await attach.json().catch(() => ({}));
      setError(body?.error ?? "Could not attach your business");
      setLoading(false);
      return;
    }
    router.push(`/dashboard/${slug}?welcome=1`);
  }

  return (
    <form
      onSubmit={hasExistingOwner ? handleLoginInstead : handleCreate}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={Boolean(paymentEmail)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {hasExistingOwner ? "Password" : "Create a password"}
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
        />
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#EA580C] disabled:opacity-60"
      >
        {loading
          ? "Setting up…"
          : hasExistingOwner
            ? "Log in and go to my dashboard"
            : "Create my login"}
      </button>

      {!hasExistingOwner ? (
        <p className="text-center text-xs text-slate-500">
          Already have a login for this email?{" "}
          <button
            type="button"
            onClick={handleLoginInstead}
            className="font-medium text-[#F97316] hover:underline"
          >
            Sign in instead
          </button>
        </p>
      ) : null}
    </form>
  );
}
