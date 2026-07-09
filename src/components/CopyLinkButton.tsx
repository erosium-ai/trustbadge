"use client";

// 🔑 Keywords: Credentials AI copy link button, dashboard copy CTA
// Small client-side copy-to-clipboard button used in the dashboard header.

import { useState } from "react";

export function CopyLinkButton({
  url,
  className = "",
}: {
  url: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50 ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* noop */
        }
      }}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
