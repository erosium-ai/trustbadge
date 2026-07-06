export const BRAND_NAME = "Credentials AI";
export const BADGE_FEATURE_NAME = "TrustBadge";
export const BADGE_FEATURE_LABEL = "Trust Badge";

const FALLBACK_SITE_URL = "https://trustbadge-production-018a.up.railway.app";
const FALLBACK_SCHEMAPAGE_URL = "https://schemapage-production.up.railway.app";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL;
  return raw.replace(/\/$/, "");
}

export function getSchemaPageUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SCHEMAPAGE_URL?.trim() || FALLBACK_SCHEMAPAGE_URL;
  return raw.replace(/\/$/, "");
}
