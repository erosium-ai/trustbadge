"use client";

/* 🔑 Keywords: Credentials AI ABN self-service form, dashboard ABN input, automatic ABR check, no email-in ABN */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AbnCheckFormProps {
  slug: string;
  currentAbn?: string;
}

interface CheckResult {
  ok: boolean;
  status?: string;
  message: string;
  matchedBusinessName?: string | null;
}

function formatAbnInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits.replace(/(\d{2})(\d{0,3})(\d{0,3})(\d{0,3})/, (_m, a, b, c, d) =>
    [a, b, c, d].filter(Boolean).join(" ")
  );
}

const RESULT_STYLES: Record<string, string> = {
  verified: "border-emerald-200 bg-emerald-50 text-emerald-900",
  verified_name_mismatch: "border-amber-200 bg-amber-50 text-amber-900",
  checksum_valid_unverified: "border-amber-200 bg-amber-50 text-amber-900",
  inactive: "border-amber-200 bg-amber-50 text-amber-900",
  not_found: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

export function AbnCheckForm({ slug, currentAbn }: AbnCheckFormProps) {
  const router = useRouter();
  const [abn, setAbn] = useState(currentAbn ? formatAbnInput(currentAbn) : "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const digits = abn.replace(/\D/g, "");
  const canSubmit = digits.length === 11 && !loading;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/dashboard/abn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, abn: digits }),
      });
      const payload = (await response.json()) as CheckResult;

      if (!response.ok || !payload.ok) {
        setResult({
          ok: false,
          status: "error",
          message:
            payload.message ||
            "Something went wrong running the check. Try again in a moment.",
        });
        return;
      }

      setResult(payload);
      router.refresh();
    } catch {
      setResult({
        ok: false,
        status: "error",
        message: "Network hiccup — try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label
        htmlFor="abn-input"
        className="block text-sm font-medium text-slate-900"
      >
        Your ABN
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="abn-input"
          inputMode="numeric"
          autoComplete="off"
          placeholder="52 699 330 553"
          value={abn}
          onChange={(event) => setAbn(formatAbnInput(event.target.value))}
          className="w-full flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-wide text-slate-900 placeholder:text-slate-400 focus:border-[#F97316] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-[#F97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Checking…" : "Check my ABN"}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        11 digits. Our system checks it against the Australian Business
        Register automatically — result in seconds. No emails, no waiting.
      </p>

      {result ? (
        <div
          role="status"
          className={`mt-4 rounded-xl border p-3 text-sm leading-relaxed ${
            RESULT_STYLES[result.status ?? "error"] ?? RESULT_STYLES.error
          }`}
        >
          <p className="font-semibold">
            {result.status === "verified"
              ? "ABN checked ✓"
              : result.ok
                ? "Check complete"
                : "Couldn’t complete the check"}
          </p>
          <p className="mt-1">{result.message}</p>
          {result.matchedBusinessName ? (
            <p className="mt-1">
              ABR entity name:{" "}
              <span className="font-medium">{result.matchedBusinessName}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
