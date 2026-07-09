/* 🔑 Keywords: quote request API, lead capture endpoint, /api/lead, lead_events insert */

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sanitizeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

function sanitizeText(value: unknown, max = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function sanitizeSessionId(value: unknown): string | null {
  const text = sanitizeText(value, 64);
  if (!text) return null;
  if (!/^[A-Za-z0-9-]{8,64}$/.test(text)) return null;
  return text;
}

function parseRecipientList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function buildLeadNotificationText(params: {
  businessName: string;
  profileSlug: string;
  type: string;
  source: string | null;
  submittedAt: string;
  name: string;
  phone: string | null;
  email: string | null;
  suburb: string | null;
  serviceNeeded: string | null;
  message: string;
}): string {
  const profileUrl = `https://credentialsai.com.au/b/${params.profileSlug}`;
  const lines = [
    "New Credentials AI lead captured",
    "",
    `Business: ${params.businessName}`,
    `Profile: ${profileUrl}`,
    `Type: ${params.type}`,
    `Source: ${params.source || "(unknown)"}`,
    `Submitted: ${params.submittedAt}`,
    "",
    "Lead details:",
    `Name: ${params.name}`,
    `Phone: ${params.phone || "(not provided)"}`,
    `Email: ${params.email || "(not provided)"}`,
    `Suburb: ${params.suburb || "(not provided)"}`,
    `Service needed: ${params.serviceNeeded || "(not provided)"}`,
    "",
    "Message:",
    params.message,
  ];

  return lines.join("\n");
}

async function sendLeadNotification(params: {
  businessName: string;
  profileSlug: string;
  type: string;
  source: string | null;
  submittedAt: string;
  name: string;
  phone: string | null;
  email: string | null;
  suburb: string | null;
  serviceNeeded: string | null;
  message: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipients = parseRecipientList(
    process.env.CREDENTIALS_AI_LEAD_NOTIFY_TO ||
      process.env.LEAD_NOTIFICATION_TO ||
      process.env.TRUSTBADGE_ADMIN_EMAILS
  );

  if (!apiKey || recipients.length === 0) {
    return false;
  }

  const from = process.env.CREDENTIALS_AI_LEAD_NOTIFY_FROM || process.env.LEAD_NOTIFICATION_FROM || "eros@erosium.com.au";
  const replyTo = params.email || undefined;
  const subject = `[Credentials AI] New lead — ${params.businessName}`;
  const text = buildLeadNotificationText(params);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "User-Agent": "credentials-ai-lead-notifier/1.0",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      text,
      reply_to: replyTo ? [replyTo] : undefined,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend request failed: ${response.status} ${body.slice(0, 240)}`);
  }

  return true;
}

async function upsertProfileSession(params: {
  service: ReturnType<typeof getServiceClient>;
  businessProfileId: string;
  existingSessionId: string | null;
  source: string | null;
  medium: string | null;
  referrer: string | null;
  landingPath: string | null;
  deviceType: string | null;
}): Promise<string | null> {
  const {
    service,
    businessProfileId,
    existingSessionId,
    source,
    medium,
    referrer,
    landingPath,
    deviceType,
  } = params;

  if (existingSessionId) {
    const { data: existing } = await service
      .from("profile_sessions")
      .select("id")
      .eq("id", existingSessionId)
      .eq("business_profile_id", businessProfileId)
      .maybeSingle();

    if (existing?.id) {
      return existing.id;
    }
  }

  const { data, error } = await service
    .from("profile_sessions")
    .insert({
      business_profile_id: businessProfileId,
      source,
      medium,
      referrer,
      landing_path: landingPath,
      device_type: deviceType,
      user_agent_class: "browser",
    })
    .select("id")
    .single();

  if (error || !data?.id) return null;
  return data.id as string;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}));

    const profileSlug = sanitizeSlug(sanitizeText(payload?.profileSlug, 80));
    if (!profileSlug) {
      return NextResponse.json({ success: false, error: "Missing profileSlug" }, { status: 400 });
    }

    const name = sanitizeText(payload?.name, 120);
    const phone = sanitizeText(payload?.phone, 60);
    const email = sanitizeText(payload?.email, 160);
    const suburb = sanitizeText(payload?.suburb, 120);
    const serviceNeeded = sanitizeText(payload?.serviceNeeded, 180);
    const message = sanitizeText(payload?.message, 1500);

    if (!name || !message) {
      return NextResponse.json({ success: false, error: "Name and message are required" }, { status: 400 });
    }

    const service = getServiceClient();

    const { data: profile, error: profileError } = await service
      .from("business_profiles")
      .select("id,slug,business_name")
      .eq("slug", profileSlug)
      .eq("status", "active")
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const sessionId = await upsertProfileSession({
      service,
      businessProfileId: profile.id as string,
      existingSessionId: sanitizeSessionId(payload?.sessionId),
      source: sanitizeText(payload?.source, 80),
      medium: sanitizeText(payload?.medium, 80),
      referrer: sanitizeText(payload?.referrer, 500),
      landingPath: sanitizeText(payload?.landingPath, 300),
      deviceType: sanitizeText(payload?.deviceType, 40),
    });

    const source = sanitizeText(payload?.source, 80);
    const referrer = sanitizeText(payload?.referrer, 500);
    const landingPath = sanitizeText(payload?.landingPath, 300);
    const medium = sanitizeText(payload?.medium, 80);
    const deviceType = sanitizeText(payload?.deviceType, 40);
    const submittedAt = new Date().toISOString();

    const { error } = await service.from("lead_events").insert({
      business_profile_id: profile.id,
      session_id: sessionId,
      type: "quote_form",
      status: "new",
      source,
      referrer,
      name,
      phone,
      email,
      suburb,
      service_needed: serviceNeeded,
      message,
      metadata: {
        via: "public_profile_quote_form",
        landing_path: landingPath,
        medium,
        device_type: deviceType,
      },
      created_at: submittedAt,
    });

    if (error) {
      console.error("[api/lead] insert failed", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return NextResponse.json({ success: false, error: "Failed to create lead" }, { status: 500 });
    }

    let notificationSent = false;
    try {
      notificationSent = await sendLeadNotification({
        businessName: profile.business_name as string,
        profileSlug: profile.slug as string,
        type: "quote_form",
        source,
        submittedAt,
        name,
        phone,
        email,
        suburb,
        serviceNeeded,
        message,
      });
    } catch (notifyError) {
      console.error("[api/lead] notification failed", {
        profileSlug: profile.slug,
        message: notifyError instanceof Error ? notifyError.message : String(notifyError),
      });
    }

    return NextResponse.json({
      success: true,
      profileSlug: profile.slug,
      businessName: profile.business_name,
      sessionId,
      notificationSent,
    });
  } catch (error) {
    console.error("[api/lead] unexpected error", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
