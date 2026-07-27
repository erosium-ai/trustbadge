"use client";

/* 🔑 Keywords: Credentials AI support link, dashboard support email, email popover, copy email, mailto fallback, Gmail compose fallback */

import { useState } from "react";

const EMAIL = "isaac@erosium.com.au";
const SUBJECT = "Credentials AI support";
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}`;
const GMAIL_COMPOSE = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(SUBJECT)}`;

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

export function SupportEmailLink({
  className,
  label = "Support",
  fullWidth = false,
}: {
  className?: string;
  label?: string;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleSupportClick() {
    const success = await copyEmail();
    setCopied(success);
    setFailed(!success);
    setOpen(true);

    // Give React a moment to paint the confirmation before asking the OS for a mail client.
    window.setTimeout(() => {
      window.location.href = MAILTO;
    }, 75);
  }

  return (
    <span
      className={`relative inline-flex flex-col items-center ${fullWidth ? "w-full" : ""}`}
    >
      <button
        type="button"
        onClick={() => void handleSupportClick()}
        aria-expanded={open}
        aria-label="Contact Credentials AI support"
        className={className}
      >
        {label}
      </button>
      {open ? (
        <span
          role="dialog"
          aria-label="Credentials AI support options"
          className="absolute bottom-full z-50 mb-3 w-72 rounded-xl border border-gray-200 bg-white p-4 text-left text-sm leading-5 text-gray-700 shadow-2xl"
        >
          <span className="block font-semibold text-gray-950">Email support</span>
          <span className="mt-1 block break-all">{EMAIL}</span>
          <span className="mt-2 block text-xs font-semibold text-emerald-700">
            {copied ? "Support email copied ✓ Opening your email app…" : "Opening your email app…"}
          </span>
          <span className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleSupportClick()}
              className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700"
            >
              {copied ? "Email copied ✓" : "Copy email"}
            </button>
            <a
              href={GMAIL_COMPOSE}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
            >
              Open Gmail compose
            </a>
          </span>
          <span className="mt-2 block text-xs text-gray-500">
            {failed ? "Copy failed — select the address above." : "If no email app opens, use Gmail compose or paste the copied address."}
          </span>
        </span>
      ) : null}
    </span>
  );
}
