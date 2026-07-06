import type { TrustBadge, Credential, CredentialType } from "./types";
import { CREDENTIAL_LABELS } from "./types";
import { BADGE_FEATURE_NAME, BRAND_NAME, getSiteUrl } from "./brand";

export function buildTrustBadgeSchema(
  trustbadge: TrustBadge,
  credentials: Credential[]
): Record<string, unknown> {
  const verifiedTypes = credentials
    .filter((c) => c.status === "verified")
    .map((c) => c.type);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: trustbadge.business_name,
    url: `${getSiteUrl()}/badge/${trustbadge.slug}`,
    identifier: trustbadge.abn
      ? { "@type": "PropertyValue", name: "ABN", value: trustbadge.abn }
      : undefined,
    additionalProperty: verifiedTypes.map((type: CredentialType) => ({
      "@type": "PropertyValue",
      name: CREDENTIAL_LABELS[type],
      value: "Verified",
    })),
    hasCredential: verifiedTypes.map((type: CredentialType) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: CREDENTIAL_LABELS[type],
      recognizedBy: {
        "@type": "Organization",
        name: `${BRAND_NAME} (${BADGE_FEATURE_NAME})`,
      },
    })),
  };
}

export function badgeSealColor(status: TrustBadge["status"]): string {
  switch (status) {
    case "verified":
      return "bg-emerald-500";
    case "pending_review":
      return "bg-amber-500";
    case "rejected":
    case "suspended":
      return "bg-red-500";
    case "draft":
    default:
      return "bg-slate-400";
  }
}
