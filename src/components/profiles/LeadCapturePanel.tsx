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
      <div className="ai-glass-soft rounded-[2rem] border-emerald-300/15 p-5 sm:p-6">
        <h2 className="text-xl font-black text-white">Ask this business anything</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Contact {businessName} directly or send an enquiry — it lands straight with the business.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <a
            href={canCall ? `tel:${phone}` : "#"}
            onClick={() => {
              if (canCall && phone) {
                void handleLeadTypeClick("call_click", "Call now", `tel:${phone}`);
              }
            }}
            className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition ${
              canCall
                ? "ai-glow-button-paid bg-gradient-to-r from-emerald-400 to-cyan-300 text-slate-950 hover:-translate-y-0.5"
                : "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
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
            className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition ${
              canEmail
                ? "border border-white/15 bg-white/8 text-white hover:bg-white/14"
                : "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
            }`}
            aria-disabled={!canEmail}
          >
            Email business
          </a>

          <button
            type="button"
            onClick={() => void openQuote()}
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/12 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/20"
          >
            Request quote
          </button>
        </div>
      </div>

      {quoteOpen && (
        <div className="ai-glass-soft mt-5 rounded-[2rem] border-emerald-300/15 p-5 sm:p-6">
          <h3 className="text-base font-black text-white">Send an enquiry</h3>
          <p className="mt-1 text-sm text-slate-300">Send your job details and get a response from the business.</p>

          {submitted && (
            <div className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-300/12 px-3 py-2 text-sm font-bold text-emerald-100">
              Enquiry sent. The business should contact you shortly.
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/12 px-3 py-2 text-sm font-bold text-red-200">
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
              className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300/40 focus:outline-none"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={leadPhone}
                onChange={(event) => setLeadPhone(event.target.value)}
                placeholder="Phone"
                className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300/40 focus:outline-none"
              />
              <input
                type="email"
                value={leadEmail}
                onChange={(event) => setLeadEmail(event.target.value)}
                placeholder="Email"
                className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300/40 focus:outline-none"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={suburb}
                onChange={(event) => setSuburb(event.target.value)}
                placeholder="Suburb"
                className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300/40 focus:outline-none"
              />
              <input
                type="text"
                value={serviceNeeded}
                onChange={(event) => setServiceNeeded(event.target.value)}
                placeholder="Service needed"
                className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300/40 focus:outline-none"
              />
            </div>

            <textarea
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us what you need"
              className="min-h-28 w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-300/40 focus:outline-none"
            />

            <p className="text-xs leading-relaxed text-slate-400">
              Credentials AI stores your enquiry and attribution details and
              sends them to {businessName} so they can respond. Submitting this
              form is not marketing consent.{" "}
              <a
                href="/privacy"
                className="font-medium text-slate-200 underline hover:text-white"
              >
                Privacy Policy
              </a>
            </p>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setQuoteOpen(false)}
                className="rounded-2xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/14"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="ai-glow-button-paid rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Submit enquiry"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/92 p-3 shadow-2xl backdrop-blur md:hidden">
        <div className="grid grid-cols-3 gap-2">
          <a
            href={canCall ? `tel:${phone}` : "#"}
            onClick={() => {
              if (canCall && phone) {
                void handleLeadTypeClick("call_click", "Sticky mobile call", `tel:${phone}`);
              }
            }}
            className={`inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-black ${
              canCall ? "bg-gradient-to-r from-emerald-400 to-cyan-300 text-slate-950" : "border border-white/10 bg-white/5 text-slate-500"
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
            className={`inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-black ${
              canEmail ? "border border-white/15 bg-white/8 text-white" : "border border-white/10 bg-white/5 text-slate-500"
            }`}
          >
            Email
          </a>
          <button
            type="button"
            onClick={() => void openQuote()}
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/12 px-3 py-2 text-xs font-black text-cyan-100"
          >
            Quote
          </button>
        </div>
      </div>
    </>
  );
}
