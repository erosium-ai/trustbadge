// 🔑 Keywords: Credentials AI dashboard ABN self-service API, ABR check endpoint, no email-in ABN, business_profiles verification_status update

import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";
import { getServiceClient } from "@/lib/supabase";
import { assertOwnership } from "@/lib/dashboard-queries";
import { verifyAbn, type AbnVerificationResult } from "@/lib/abn";
import type { TrustBadgeStatus, VerificationSourceEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapProfileVerificationStatus(
  result: AbnVerificationResult
): string | null {
  switch (result.status) {
    case "verified":
      return "verified";
    case "verified_name_mismatch":
    case "inactive":
    case "not_found":
      return "action_needed";
    case "checksum_valid_unverified":
      return "pending_review";
    default:
      return null;
  }
}

function mapTrustBadgeStatus(
  result: AbnVerificationResult
): TrustBadgeStatus | null {
  switch (result.status) {
    case "verified":
      return "verified";
    case "verified_name_mismatch":
    case "checksum_valid_unverified":
      return "pending_review";
    case "inactive":
    case "not_found":
      return "rejected";
    default:
      return null;
  }
}

function mapSourceStatus(
  result: AbnVerificationResult
): VerificationSourceEntry["status"] {
  switch (result.status) {
    case "verified":
      return "verified";
    case "verified_name_mismatch":
      return "mismatch";
    case "checksum_valid_unverified":
      return "pending";
    default:
      return "failed";
  }
}

function isMissingTrustBadgeVerificationColumnError(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("verification_sources") ||
    lower.includes("verification_confidence") ||
    lower.includes("verification_summary") ||
    lower.includes("last_verified_at")
  );
}

export async function POST(request: NextRequest) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  let body: { slug?: string; abn?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const slug = (body.slug || "").trim().toLowerCase();
  const abn = (body.abn || "").trim();
  if (!slug || !abn) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const ownership = await assertOwnership(slug, user.id);
  if (!ownership.ok || !ownership.record) {
    return NextResponse.json({ ok: false, error: "not_owner" }, { status: 403 });
  }

  const businessName = ownership.record.business_name;
  const result = await verifyAbn(abn, businessName);

  if (result.status === "format_invalid") {
    return NextResponse.json(
      { ok: false, error: "format_invalid", message: result.message },
      { status: 400 }
    );
  }
  if (result.status === "error") {
    return NextResponse.json(
      { ok: false, error: "abr_error", message: result.message },
      { status: 502 }
    );
  }

  const profileStatus = mapProfileVerificationStatus(result);
  const badgeStatus = mapTrustBadgeStatus(result);
  const serviceClient = getServiceClient();

  // 1. business_profiles — the dashboard record.
  const { error: profileError } = await serviceClient
    .from("business_profiles")
    .update({
      abn: result.normalizedAbn,
      verification_status: profileStatus,
    })
    .eq("id", ownership.record.id);

  if (profileError) {
    console.error("[dashboard/abn] business_profiles update failed", {
      slug,
      message: profileError.message,
    });
    return NextResponse.json(
      { ok: false, error: "save_failed", message: "Could not save your ABN. Try again in a moment." },
      { status: 500 }
    );
  }

  // 2. trustbadges — drives the TrustSeal + public badge. Row may not exist
  //    for pure business_profiles customers, so tolerate that.
  if (badgeStatus) {
    const { data: badgeRow } = await serviceClient
      .from("trustbadges")
      .select("id, verification_sources")
      .eq("slug", slug)
      .maybeSingle();

    if (badgeRow) {
      const existingSources = Array.isArray(
        (badgeRow as { verification_sources?: unknown }).verification_sources
      )
        ? ((badgeRow as { verification_sources: VerificationSourceEntry[] })
            .verification_sources
        ).filter((entry) => entry.source_type !== "registry")
        : [];

      const newSource: VerificationSourceEntry = {
        source_name: result.source,
        source_type: "registry",
        status: mapSourceStatus(result),
        checked_at: result.checkedAt,
        notes: result.message,
        reference_id: result.normalizedAbn || undefined,
        details: {
          status: result.status,
          confidence: result.confidence,
          matchedBusinessName: result.matchedBusinessName ?? null,
          abrStatus: result.abrStatus ?? null,
        },
      };

      const sources = [...existingSources, newSource];
      const summary = sources
        .map((entry) => `${entry.source_name}: ${entry.notes ?? entry.status}`)
        .join(" | ");

      const fullUpdate = {
        abn: result.normalizedAbn,
        status: badgeStatus,
        verification_confidence: result.confidence,
        verification_sources: sources,
        last_verified_at: result.checkedAt,
        verification_summary: summary,
      };

      let { error: badgeError } = await serviceClient
        .from("trustbadges")
        .update(fullUpdate)
        .eq("id", (badgeRow as { id: string }).id);

      if (badgeError && isMissingTrustBadgeVerificationColumnError(badgeError.message)) {
        const fallback = await serviceClient
          .from("trustbadges")
          .update({ abn: result.normalizedAbn, status: badgeStatus })
          .eq("id", (badgeRow as { id: string }).id);
        badgeError = fallback.error;
      }

      if (badgeError) {
        // Non-fatal: the dashboard record already saved. Log and continue.
        console.error("[dashboard/abn] trustbadges update failed", {
          slug,
          message: badgeError.message,
        });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    status: result.status,
    profileStatus,
    message: result.message,
    matchedBusinessName: result.matchedBusinessName ?? null,
    abrStatus: result.abrStatus ?? null,
    checkedAt: result.checkedAt,
  });
}
