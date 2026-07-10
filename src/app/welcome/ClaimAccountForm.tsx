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

function claimErrorMessage(code: unknown): string {
  switch (code) {
    case "email_mismatch":
      return "That email doesn't match the one used for payment. Use your payment email, or contact help@credentialsai.com.au.";
    case "password_too_short":
      return "Password must be at least 8 characters.";
    case "invalid_email":
      return "Please enter a valid email address.";
    case "profile_not_found":
      return "We couldn't find your business profile — email help@credentialsai.com.au and we'll sort it.";
    default:
      return typeof code === "string" ? code : "Could not create your account";
  }
}

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
      // Create the account SERVER-SIDE (admin API, pre-confirmed email) and
      // attach ownership in the same call. A browser signUp() would return
      // no session while Supabase email confirmation is enabled, causing the
      // attach call to 401.
      const claim = await fetch("/api/founding/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, email, password }),
      });

      if (!claim.ok) {
        const body = await claim.json().catch(() => ({}));
        if (body?.error === "email_exists" || body?.error === "already_owned") {
          // Existing account for this email — fall through to password login.
          await handleLoginInsteadInner();
          return;
        }
        setError(claimErrorMessage(body?.error));
        setLoading(false);
        return;
      }

      // Account exists + ownership attached — now establish the session.
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authErr || !data.user) {
        setError(authErr?.message ?? "Account created — please log in");
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
    await handleLoginInsteadInner();
  }

  async function handleLoginInsteadInner() {
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
