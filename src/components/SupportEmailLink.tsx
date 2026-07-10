"use client";

/* 🔑 Keywords: Credentials AI support link, email copy fallback, mailto fallback, support interaction */

import { useState } from "react";

const SUPPORT_EMAIL = "support@erosium.ai";
const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Credentials AI support")}`;

type CopyState = "idle" | "copied" | "failed";

async function copySupportEmail(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(SUPPORT_EMAIL);
    return true;
  } catch {
    const input = document.createElement("textarea");
    input.value = SUPPORT_EMAIL;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  }
}

export function SupportEmailLink({ className }: { className?: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  async function handleSupportClick() {
    const copied = await copySupportEmail();
    setCopyState(copied ? "copied" : "failed");

    // Give the visible fallback confirmation time to render, then ask the
    // visitor's device to open its configured email app if one exists.
    window.setTimeout(() => {
      window.location.href = SUPPORT_MAILTO;
    }, 150);
  }

  return (
    <span className="inline-flex flex-col items-center">
      <button type="button" onClick={handleSupportClick} className={className}>
        Support
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copyState === "copied"
          ? `Support email copied: ${SUPPORT_EMAIL}. Your email app will open if configured.`
          : copyState === "failed"
            ? `Email ${SUPPORT_EMAIL} for support.`
            : ""}
      </span>
      {copyState !== "idle" ? (
        <span className="mt-1 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg">
          {copyState === "copied" ? `Copied: ${SUPPORT_EMAIL}` : SUPPORT_EMAIL}
        </span>
      ) : null}
    </span>
  );
}
