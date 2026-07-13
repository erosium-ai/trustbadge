/* 🔑 Keywords: conversion tracking, CTA tracking, Credentials AI click events, /api/track */

export interface TrackCtaClickInput {
  eventName: string;
  source?: string;
  campaign?: string;
  targetUrl?: string;
  label?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  metadata?: Record<string, unknown>;
}

function readQueryParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

export function trackCtaClick(input: TrackCtaClickInput): void {
  if (typeof window === "undefined") return;

  const body = {
    eventName: input.eventName,
    source: input.source ?? readQueryParam("source"),
    campaign: input.campaign ?? readQueryParam("campaign"),
    targetUrl: input.targetUrl,
    label: input.label,
    utmSource: input.utmSource ?? readQueryParam("utm_source"),
    utmMedium: input.utmMedium ?? readQueryParam("utm_medium"),
    utmCampaign: input.utmCampaign ?? readQueryParam("utm_campaign"),
    utmContent: input.utmContent ?? readQueryParam("utm_content"),
    metadata: {
      path: window.location.pathname,
      search: window.location.search,
      referrer: document.referrer || null,
      ...(input.metadata ?? {}),
    },
  };

  try {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // Tracking is best-effort and must never block UX.
  }
}
