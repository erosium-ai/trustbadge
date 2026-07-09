/* 🔑 Keywords: /start route, branded onboarding URL, query pass-through, Credentials AI attribution */

import { NextResponse } from "next/server";
import { getSchemaPageUrl } from "@/lib/brand";

export const dynamic = "force-dynamic";

function ensureParam(url: URL, key: string, value: string) {
  const existing = url.searchParams.get(key);
  if (!existing || !existing.trim()) {
    url.searchParams.set(key, value);
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const target = new URL(getSchemaPageUrl());

  for (const [key, value] of requestUrl.searchParams.entries()) {
    target.searchParams.append(key, value);
  }

  const campaign =
    target.searchParams.get("campaign") ||
    target.searchParams.get("utm_campaign") ||
    "start_route";

  ensureParam(target, "source", "credentialsai");
  ensureParam(target, "campaign", campaign);
  ensureParam(target, "utm_source", "credentialsai");
  ensureParam(target, "utm_medium", "website");
  ensureParam(target, "utm_campaign", campaign);
  ensureParam(target, "utm_content", "start_route");
  ensureParam(target, "entrypoint", "start");

  return NextResponse.redirect(target.toString(), { status: 307 });
}
