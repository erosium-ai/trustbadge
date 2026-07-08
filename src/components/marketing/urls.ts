import { getSchemaPageUrl } from "@/lib/brand";

export function withTracking(baseUrl: string, params: Record<string, string>): string {
  try {
    const url = new URL(baseUrl);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function getFreeProfileUrl(campaign = "homepage_free_ai_profile"): string {
  return withTracking(getSchemaPageUrl(), {
    source: "credentialsai",
    campaign,
    utm_source: "credentialsai",
    utm_medium: "website",
    utm_campaign: campaign,
    utm_content: "free_ai_profile",
  });
}

export function getFounderBundleUrl(campaign = "homepage_founder_bundle"): string {
  return withTracking(getSchemaPageUrl(), {
    intent: "founder_bundle",
    source: "credentialsai",
    campaign,
    utm_source: "credentialsai",
    utm_medium: "website",
    utm_campaign: campaign,
    utm_content: "founder_bundle",
  });
}

export function getProPresenceUrl(campaign = "homepage_pro_ai_presence"): string {
  return withTracking(getSchemaPageUrl(), {
    intent: "pro",
    source: "credentialsai",
    campaign,
    utm_source: "credentialsai",
    utm_medium: "website",
    utm_campaign: campaign,
    utm_content: "pro_ai_presence",
  });
}
