"use client";

/* 🔑 Keywords: Credentials AI support link, email popover, copy email, mailto fallback */

import { useState } from "react";

const EMAIL = "support@erosium.ai";
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent("Credentials AI support")}`;

async function copyEmail(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(EMAIL);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = EMAIL;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  }
}

export function SupportEmailLink({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleCopy() {
    const success = await copyEmail();
    setCopied(success);
    setFailed(!success);
  }

  return (
    <span className="relative inline-flex flex-col items-center">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setCopied(false);
          setFailed(false);
        }}
        aria-expanded={open}
        aria-label="Contact Credentials AI support"
        className={className}
      >
        Support
      </button>
      {open ? (
        <span
          role="dialog"
          aria-label="Credentials AI support options"
          className="absolute bottom-full z-50 mb-3 w-72 rounded-xl border border-slate-200 bg-white p-4 text-left text-sm leading-5 text-slate-700 shadow-2xl"
        >
          <span className="block font-semibold text-slate-950">Email support</span>
          <span className="mt-1 block break-all">{EMAIL}</span>
          <span className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
            >
              {copied ? "Email copied ✓" : "Copy email"}
            </button>
            <a
              href={MAILTO}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Open email app
            </a>
          </span>
          <span className="mt-2 block text-xs text-slate-500">
            {failed ? "Copy failed — select the address above." : "If no email app opens, copy the address instead."}
          </span>
        </span>
      ) : null}
    </span>
  );
}
