"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase-browser";
import { createTrustBadge } from "@/lib/trustbadge";
import { BADGE_FEATURE_NAME, BRAND_NAME } from "@/lib/brand";

function getTrackingParamsFromLocation() {
  if (typeof window === "undefined") {
    return {
      source: null,
      slug: null,
      campaign: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get("source"),
    slug: params.get("slug"),
    campaign: params.get("campaign"),
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmContent: params.get("utm_content"),
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [abn, setAbn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getBrowserClient();

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        setError(authError?.message ?? "Registration failed");
        setLoading(false);
        return;
      }

      const result = await createTrustBadge(
        authData.user.id,
        businessName,
        abn || undefined
      );

      if (!result.success || !result.trustbadge) {
        setError(result.error ?? "Could not create badge");
        setLoading(false);
        return;
      }

      const tracking = getTrackingParamsFromLocation();
      const hasTracking =
        Boolean(tracking.source) ||
        Boolean(tracking.slug) ||
        Boolean(tracking.campaign) ||
        Boolean(tracking.utmSource) ||
        Boolean(tracking.utmMedium) ||
        Boolean(tracking.utmCampaign) ||
        Boolean(tracking.utmContent);

      if (hasTracking) {
        const payload = {
          event: "credentials_ai_register_success",
          trustbadge_slug: result.trustbadge.slug,
          source: tracking.source,
          source_slug: tracking.slug,
          campaign: tracking.campaign,
          utm_source: tracking.utmSource,
          utm_medium: tracking.utmMedium,
          utm_campaign: tracking.utmCampaign,
          utm_content: tracking.utmContent,
        };

        // MVP analytics lane: lightweight console event for immediate observability.
        // Can later be swapped to a DB/event sink without changing param contract.
        console.info("[tracking]", payload);
      }

      router.push(`/dashboard/${result.trustbadge.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">
        Create your {BADGE_FEATURE_NAME}
      </h1>
      <p className="mt-2 text-slate-600">
        Start by registering your business on {BRAND_NAME}.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Business name
          </label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            ABN
          </label>
          <input
            type="text"
            value={abn}
            placeholder="Optional — verify in Week 2"
            onChange={(e) => setAbn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Creating…" : `Create ${BADGE_FEATURE_NAME}`}
        </button>
      </form>
    </div>
  );
}
