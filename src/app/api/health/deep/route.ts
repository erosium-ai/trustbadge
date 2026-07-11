import { NextRequest, NextResponse } from "next/server";
import { isHealthCheckAuthorized } from "@/lib/health-auth";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CANARY_SLUG =
  process.env.CREDENTIALS_AI_HEALTHCHECK_CANARY_SLUG?.trim() || "beastly-tech-gc";
const CANARY_ABN =
  process.env.CREDENTIALS_AI_HEALTHCHECK_CANARY_ABN?.replace(/\D/g, "") || "52699330553";

export async function GET(request: NextRequest) {
  if (!isHealthCheckAuthorized(request)) {
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();

  try {
    const supabase = getServiceClient();
    const [profileResult, badgeResult] = await Promise.all([
      supabase
        .from("business_profiles")
        .select("id,slug,business_name,status,verification_status")
        .eq("slug", CANARY_SLUG)
        .maybeSingle(),
      supabase
        .from("trustbadges")
        .select("id,slug,business_name,status,abn,verification_confidence")
        .eq("slug", CANARY_SLUG)
        .maybeSingle(),
    ]);

    const failures: string[] = [];

    if (profileResult.error) failures.push(`business_profile_read:${profileResult.error.code || "error"}`);
    if (!profileResult.data) failures.push("business_profile_canary:missing");
    if (profileResult.data?.status !== "active") failures.push("business_profile_canary:not_active");

    if (badgeResult.error) failures.push(`trustbadge_read:${badgeResult.error.code || "error"}`);
    if (!badgeResult.data) failures.push("trustbadge_canary:missing");
    if (badgeResult.data?.abn?.replace(/\D/g, "") !== CANARY_ABN) {
      failures.push("trustbadge_canary:abn_mismatch");
    }

    if (failures.length > 0) {
      return NextResponse.json(
        {
          status: "fail",
          service: "credentials-ai",
          checks: failures,
          duration_ms: Date.now() - startedAt,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      service: "credentials-ai",
      checks: {
        supabase: "ok",
        business_profile_canary: "ok",
        trustbadge_canary: "ok",
      },
      duration_ms: Date.now() - startedAt,
    });
  } catch (error) {
    console.error("[health/deep] read-only health check failed", error);
    return NextResponse.json(
      {
        status: "fail",
        service: "credentials-ai",
        checks: ["deep_health_exception"],
        duration_ms: Date.now() - startedAt,
      },
      { status: 503 }
    );
  }
}
