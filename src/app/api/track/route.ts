/* 🔑 Keywords: conversion events API, CTA event tracking endpoint, Credentials AI analytics */

import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sanitizeSlug } from "@/lib/slug";

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

function sanitizeSessionId(value: unknown): string | null {
  const text = sanitize(value, 64);
  if (!text) return null;
  if (!/^[A-Za-z0-9-]{8,64}$/.test(text)) return null;
  return text;
}

function isMissingProfileTablesError(message?: string): boolean {
  const lowered = (message || "").toLowerCase();
  return (
    (lowered.includes("relation") && lowered.includes("business_profiles") && lowered.includes("does not exist")) ||
    (lowered.includes("relation") && lowered.includes("profile_sessions") && lowered.includes("does not exist")) ||
    (lowered.includes("relation") && lowered.includes("profile_views") && lowered.includes("does not exist")) ||
    (lowered.includes("relation") && lowered.includes("lead_events") && lowered.includes("does not exist"))
  );
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));

    const eventName = sanitize(payload?.eventName, 120);
    if (!eventName) {
      return NextResponse.json({ success: false, error: "Missing eventName" }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    const nowIso = new Date().toISOString();

    const { error: conversionError } = await serviceClient.from("conversion_events").insert({
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
      occurred_at: nowIso,
    });

    if (conversionError && !isMissingConversionEventsRelationError(conversionError.message)) {
      console.error("[track-api] conversion insert failed", {
        message: conversionError.message,
        code: conversionError.code,
        details: conversionError.details,
      });
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const profileSlugRaw = sanitize(payload?.profileSlug, 80);
    const profileSlug = sanitizeSlug(profileSlugRaw ?? "");
    const leadType = sanitize(payload?.leadType, 40);
    let sessionId = sanitizeSessionId(payload?.sessionId);

    if (profileSlug) {
      const { data: profile, error: profileError } = await serviceClient
        .from("business_profiles")
        .select("id,slug")
        .eq("slug", profileSlug)
        .eq("status", "active")
        .maybeSingle();

      if (profileError && !isMissingProfileTablesError(profileError.message)) {
        console.error("[track-api] profile lookup failed", {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
        });
      }

      if (profile?.id) {
        if (sessionId) {
          const { data: existingSession } = await serviceClient
            .from("profile_sessions")
            .select("id")
            .eq("id", sessionId)
            .eq("business_profile_id", profile.id)
            .maybeSingle();

          if (!existingSession?.id) {
            sessionId = null;
          }
        }

        if (!sessionId) {
          const { data: newSession, error: sessionError } = await serviceClient
            .from("profile_sessions")
            .insert({
              business_profile_id: profile.id,
              source: sanitize(payload?.source, 80),
              medium: sanitize(payload?.medium, 80),
              referrer: sanitize(payload?.referrer, 500),
              landing_path: sanitize(payload?.landingPath, 300),
              device_type: sanitize(payload?.deviceType, 40),
              user_agent_class: "browser",
            })
            .select("id")
            .single();

          if (sessionError && !isMissingProfileTablesError(sessionError.message)) {
            console.error("[track-api] profile session insert failed", {
              message: sessionError.message,
              code: sessionError.code,
              details: sessionError.details,
            });
          }

          if (newSession?.id) {
            sessionId = newSession.id as string;
          }
        }

        const source = sanitize(payload?.source, 80);
        const referrer = sanitize(payload?.referrer, 500);
        const targetUrl = sanitize(payload?.targetUrl, 500);

        const { error: viewError } = await serviceClient.from("profile_views").insert({
          business_profile_id: profile.id,
          session_id: sessionId,
          path: sanitize(payload?.landingPath, 300),
          source,
          referrer,
          metadata: {
            event_name: eventName,
            label: sanitize(payload?.label, 200),
          },
        });

        if (viewError && !isMissingProfileTablesError(viewError.message)) {
          console.error("[track-api] profile view insert failed", {
            message: viewError.message,
            code: viewError.code,
            details: viewError.details,
          });
        }

        if (leadType) {
          const allowedLeadTypes = new Set([
            "call_click",
            "email_click",
            "quote_form_open",
            "booking_click",
            "qr_scan",
            "badge_click",
          ]);

          if (allowedLeadTypes.has(leadType)) {
            const { error: leadError } = await serviceClient.from("lead_events").insert({
              business_profile_id: profile.id,
              session_id: sessionId,
              type: leadType,
              source,
              referrer,
              metadata: {
                event_name: eventName,
                label: sanitize(payload?.label, 200),
                target_url: targetUrl,
                medium: sanitize(payload?.medium, 80),
              },
              created_at: nowIso,
            });

            if (leadError && !isMissingProfileTablesError(leadError.message)) {
              console.error("[track-api] lead event insert failed", {
                message: leadError.message,
                code: leadError.code,
                details: leadError.details,
              });
            }
          }
        }
      }
    }

    const degraded = Boolean(conversionError && isMissingConversionEventsRelationError(conversionError.message));
    return NextResponse.json({ success: true, degraded, sessionId });
  } catch (error) {
    console.error("[track-api] unexpected error", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

