// 🔑 Keywords: Credentials AI V2, Family GTM, promo claim route, one-time claim token, scanner-safe auth
// Isolated promo claim handoff. Never accepts slug/email from the browser.
// Parallel path to paid /welcome — Stripe session verification is intentionally absent.

import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/brand";
import {
  PROMO_ALREADY_CLAIMED,
  PROMO_GENERIC_UNAVAILABLE,
  buildPromoLoginUrl,
  buildPromoStatusUrl,
  completePromoClaimLogin,
  isWellFormedClaimToken,
} from "@/lib/promo-claim-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noReferrerRedirect(url: string, status = 303): NextResponse {
  const response = NextResponse.redirect(url, status);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");

  if (!isWellFormedClaimToken(token)) {
    return noReferrerRedirect(buildPromoStatusUrl("unavailable"));
  }

  try {
    const result = await completePromoClaimLogin({ claimToken: token.trim() });

    if (result.ok) {
      return noReferrerRedirect(result.confirmUrl);
    }

    if (result.reason === PROMO_ALREADY_CLAIMED && result.slug) {
      // Already claimed: send to normal login for that dashboard without leaking email.
      // Use canonical public origin — never Railway internal Host/localhost.
      return noReferrerRedirect(
        new URL(buildPromoLoginUrl(result.slug), getSiteUrl()).toString()
      );
    }

    if (result.reason === PROMO_GENERIC_UNAVAILABLE || result.reason === PROMO_ALREADY_CLAIMED) {
      return noReferrerRedirect(
        buildPromoStatusUrl(
          result.reason === PROMO_ALREADY_CLAIMED ? "already_claimed" : "unavailable",
          result.slug
        )
      );
    }

    return noReferrerRedirect(buildPromoStatusUrl("unavailable"));
  } catch (error) {
    console.error("promo_claim_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return noReferrerRedirect(buildPromoStatusUrl("unavailable"));
  }
}
