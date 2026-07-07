/* 🔑 Keywords: conversion events API, CTA event tracking endpoint, Credentials AI analytics */

import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

function isMissingConversionEventsRelationError(message?: string): boolean {
  const lowered = (message || "").toLowerCase();
  return lowered.includes("relation") && lowered.includes("conversion_events") && lowered.includes("does not exist");
}

function sanitize(value: unknown, max = 120): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));

    const eventName = sanitize(payload?.eventName, 120);
    if (!eventName) {
      return NextResponse.json({ success: false, error: "Missing eventName" }, { status: 400 });
    }

    const serviceClient = getServiceClient();

    const { error } = await serviceClient.from("conversion_events").insert({
      event_name: eventName,
      source: sanitize(payload?.source, 80),
      campaign: sanitize(payload?.campaign, 120),
      utm_source: sanitize(payload?.utmSource, 120),
      utm_medium: sanitize(payload?.utmMedium, 120),
      utm_campaign: sanitize(payload?.utmCampaign, 120),
      utm_content: sanitize(payload?.utmContent, 120),
      metadata: {
        target_url: sanitize(payload?.targetUrl, 500),
        label: sanitize(payload?.label, 200),
        ...(typeof payload?.metadata === "object" && payload?.metadata ? payload.metadata : {}),
      },
      occurred_at: new Date().toISOString(),
    });

    if (error) {
      if (isMissingConversionEventsRelationError(error.message)) {
        return NextResponse.json({ success: true, degraded: true });
      }
      console.error("[track-api] failed", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[track-api] unexpected error", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

