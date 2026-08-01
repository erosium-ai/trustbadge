"use client";

import { useMemo, useState } from "react";

const COLOR_OPTIONS = [
  { value: "#10b981", label: "Emerald" },
  { value: "#f97316", label: "Sunset Orange" },
  { value: "#facc15", label: "Signal Yellow" },
  { value: "#0ea5e9", label: "Sky Blue" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#ef4444", label: "Red" },
  { value: "#22c55e", label: "Green" },
] as const;

type SaveState = "idle" | "saving" | "saved" | "error";

interface ProfileColorPickerProps {
  slug: string;
  initialColor: string;
}

function normalizeColor(value: string | null | undefined): string {
  if (typeof value !== "string") return "#10b981";
  const normalized = value.trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(normalized)) return "#10b981";
  if (!COLOR_OPTIONS.some((option) => option.value === normalized)) return "#10b981";
  return normalized;
}

export function ProfileColorPicker({ slug, initialColor }: ProfileColorPickerProps) {
  const startColor = useMemo(() => normalizeColor(initialColor), [initialColor]);
  const [selected, setSelected] = useState(startColor);
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const dirty = selected !== startColor;

  async function saveColor() {
    if (!dirty || state === "saving") return;
    setState("saving");
    setError(null);

    try {
      const response = await fetch("/api/dashboard/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, brandColor: selected }),
      });

      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.ok) {
        throw new Error(json?.message || "Could not save your color right now.");
      }

      setState("saved");
      setTimeout(() => window.location.reload(), 500);
    } catch (saveError) {
      setState("error");
      setError(saveError instanceof Error ? saveError.message : "Could not save your color right now.");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h3 className="text-base font-semibold text-slate-900">Profile colour</h3>
      <p className="mt-2 text-sm text-slate-600">
        Change your profile colour any time. Click <span className="font-semibold">View my profile</span> to check how it looks live.
      </p>

      <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">
        {COLOR_OPTIONS.map((option) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSelected(option.value);
                setState("idle");
                setError(null);
              }}
              className={`group rounded-xl border p-1 transition ${
                active
                  ? "border-slate-900 ring-2 ring-slate-900/10"
                  : "border-slate-200 hover:border-slate-400"
              }`}
              aria-label={`Choose ${option.label}`}
              title={option.label}
            >
              <span
                className="block h-8 w-full rounded-lg"
                style={{ backgroundColor: option.value }}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-slate-500">Selected: <span className="font-mono">{selected}</span></div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={saveColor}
          disabled={!dirty || state === "saving"}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {state === "saving" ? "Saving..." : "Save colour"}
        </button>

        {state === "saved" ? (
          <span className="text-sm font-medium text-emerald-700">Saved. Refreshing view…</span>
        ) : null}

        {state === "error" ? (
          <span className="text-sm font-medium text-red-700">{error ?? "Could not save your color right now."}</span>
        ) : null}
      </div>
    </div>
  );
}

