import { NextRequest, NextResponse } from "next/server";
import { verifyAbn } from "@/lib/abn";
import { isHealthCheckAuthorized } from "@/lib/health-auth";

export const dynamic = "force-dynamic";

const CANARY_ABN =
  process.env.CREDENTIALS_AI_HEALTHCHECK_CANARY_ABN?.trim() || "52 699 330 553";
const CANARY_NAME =
  process.env.CREDENTIALS_AI_HEALTHCHECK_CANARY_NAME?.trim() || "Beastly Tech GC Pty Ltd";

export async function GET(request: NextRequest) {
  if (!isHealthCheckAuthorized(request)) {
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const result = await verifyAbn(CANARY_ABN, CANARY_NAME);

  if (result.status !== "verified" || result.abrStatus?.toLowerCase() !== "active") {
    console.error("[health/abr] ABR canary failed", {
      status: result.status,
      abrStatus: result.abrStatus,
      message: result.message,
    });
    return NextResponse.json(
      {
        status: "fail",
        service: "abr-business-register",
        check: result.status,
        duration_ms: Date.now() - startedAt,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    service: "abr-business-register",
    check: "known_active_abn_verified",
    duration_ms: Date.now() - startedAt,
  });
}
