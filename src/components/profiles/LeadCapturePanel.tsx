"use client";

/* 🔑 Keywords: lead capture panel, tracked call click, tracked email click, quote form, sticky mobile CTA */

import { FormEvent, useEffect, useMemo, useState } from "react";

interface LeadCapturePanelProps {
  profileSlug: string;
  businessName: string;
  phone?: string | null;
  email?: string | null;
}

type LeadType = "call_click" | "email_click" | "quote_form_open";

function getSessionStorageKey(slug: string): string {
  return `credentials_ai_session_${slug}`;
}

function getOrCreateSessionId(slug: string): string | null {
  if (typeof window === "undefined") return null;

  const key = getSessionStorageKey(slug);
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

  window.localStorage.setItem(key, id);
  return id;
}

function readAttribution() {
  if (typeof window === "undefined") {
    return {
      source: null as string | null,
      medium: null as string | null,
      landingPath: null as string | null,
      referrer: null as string | null,
      deviceType: null as string | null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const source = params.get("src") || params.get("utm_source") || null;
  const medium = params.get("utm_medium") || null;
  const landingPath = `${window.location.pathname}${window.location.search}`;
  const referrer = document.referrer || null;
  const deviceType = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    ? "mobile"
    : "desktop";

  return { source, medium, landingPath, referrer, deviceType };
}

async function postTrack(params: {
  profileSlug: string;
  eventName: string;
  leadType?: LeadType;
  label?: string;
  targetUrl?: string;
  sessionId?: string | null;
}) {
  const attribution = readAttribution();

  try {
    const response = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileSlug: params.profileSlug,
        eventName: params.eventName,
        leadType: params.leadType,
        label: params.label,
        targetUrl: params.targetUrl,
        sessionId: params.sessionId,
        source: attribution.source,
        medium: attribution.medium,
        landingPath: attribution.landingPath,
        referrer: attribution.referrer,
        deviceType: attribution.deviceType,
      }),
      keepalive: true,
    });

    if (response.ok) {
      const json = await response.json().catch(() => null);
      if (json?.sessionId && typeof window !== "undefined") {
        window.localStorage.setItem(getSessionStorageKey(params.profileSlug), json.sessionId);
      }
    }
  } catch {
    // best-effort tracking only
  }
}

export function LeadCapturePanel({
  profileSlug,
  businessName,
  phone,
  email,
}: LeadCapturePanelProps) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [suburb, setSuburb] = useState("");
  const [serviceNeeded, setServiceNeeded] = useState("");
  const [message, setMessage] = useState("");

  const canCall = Boolean(phone?.trim());
  const canEmail = Boolean(email?.trim());

  const sessionId = useMemo(() => getOrCreateSessionId(profileSlug), [profileSlug]);

  useEffect(() => {
    void postTrack({
      profileSlug,
      eventName: "credentials_ai_profile_view",
      sessionId,
      label: businessName,
    });
  }, [businessName, profileSlug, sessionId]);

  async function handleLeadTypeClick(leadType: LeadType, label: string, targetUrl?: string) {
    await postTrack({
      profileSlug,
      eventName: `credentials_ai_${leadType}`,
      leadType,
      label,
      targetUrl,
      sessionId,
    });
  }

  async function openQuote() {
    setQuoteOpen(true);
    await handleLeadTypeClick("quote_form_open", "Request quote");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const attribution = readAttribution();

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileSlug,
          sessionId,
          source: attribution.source,
          medium: attribution.medium,
          landingPath: attribution.landingPath,
          referrer: attribution.referrer,
          deviceType: attribution.deviceType,
          name,
          phone: leadPhone,
          email: leadEmail,
          suburb,
          serviceNeeded,
          message,
        }),
      });

      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.success) {
        throw new Error(json?.error || `Request failed (${response.status})`);
      }

      if (json?.sessionId && typeof window !== "undefined") {
        window.localStorage.setItem(getSessionStorageKey(profileSlug), json.sessionId);
      }

      setSubmitted(true);
      setName("");
      setLeadPhone("");
      setLeadEmail("");
      setSuburb("");
      setServiceNeeded("");
      setMessage("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit quote request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Get in touch</h2>
        <p className="mt-1 text-sm text-slate-600">
          Contact {businessName} directly or request a quote now.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <a
            href={canCall ? `tel:${phone}` : "#"}
            onClick={() => {
              if (canCall && phone) {
                void handleLeadTypeClick("call_click", "Call now", `tel:${phone}`);
              }
            }}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold ${
              canCall
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
            aria-disabled={!canCall}
          >
            Call now
          </a>

          <a
            href={canEmail ? `mailto:${email}` : "#"}
            onClick={() => {
              if (canEmail && email) {
                void handleLeadTypeClick("email_click", "Email business", `mailto:${email}`);
              }
            }}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold ${
              canEmail
                ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
            aria-disabled={!canEmail}
          >
            Email business
          </a>

          <button
            type="button"
            onClick={() => void openQuote()}
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Request quote
          </button>
        </div>
      </div>

      {quoteOpen && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Quote request</h3>
          <p className="mt-1 text-sm text-slate-600">Send your job details and get a response from the business.</p>

          {submitted && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Quote request sent. The business should contact you shortly.
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={leadPhone}
                onChange={(event) => setLeadPhone(event.target.value)}
                placeholder="Phone"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="email"
                value={leadEmail}
                onChange={(event) => setLeadEmail(event.target.value)}
                placeholder="Email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={suburb}
                onChange={(event) => setSuburb(event.target.value)}
                placeholder="Suburb"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={serviceNeeded}
                onChange={(event) => setServiceNeeded(event.target.value)}
                placeholder="Service needed"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <textarea
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us what you need"
              className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setQuoteOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send quote request"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <div className="grid grid-cols-3 gap-2">
          <a
            href={canCall ? `tel:${phone}` : "#"}
            onClick={() => {
              if (canCall && phone) {
                void handleLeadTypeClick("call_click", "Sticky mobile call", `tel:${phone}`);
              }
            }}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold ${
              canCall ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
            }`}
          >
            Call
          </a>
          <a
            href={canEmail ? `mailto:${email}` : "#"}
            onClick={() => {
              if (canEmail && email) {
                void handleLeadTypeClick("email_click", "Sticky mobile email", `mailto:${email}`);
              }
            }}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold ${
              canEmail ? "border border-slate-300 bg-white text-slate-700" : "bg-slate-100 text-slate-400"
            }`}
          >
            Email
          </a>
          <button
            type="button"
            onClick={() => void openQuote()}
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white"
          >
            Quote
          </button>
        </div>
      </div>
    </>
  );
}
