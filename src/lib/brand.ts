export const BRAND_NAME = "Credentials AI";
export const BADGE_FEATURE_NAME = "TrustBadge";
export const BADGE_FEATURE_LABEL = "Trust Badge";

const FALLBACK_SITE_URL = "https://trustbadge-production-018a.up.railway.app";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL;
  return raw.replace(/\/$/, "");
}

