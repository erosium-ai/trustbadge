export type TrustBadgeStatus =
  | "draft"
  | "pending_review"
  | "verified"
  | "rejected"
  | "suspended";

export type CredentialType =
  | "trade_license"
  | "abn"
  | "first_aid";

export type LegacyCredentialType =
  | "qbcc_licence"
  | "electrical_licence"
  | "plumbing_licence"
  | "public_liability"
  | "workers_compensation"
  | "police_check"
  | "blue_card"
  | "other_licence";

const CORE_CREDENTIAL_TYPES: CredentialType[] = ["trade_license", "first_aid", "abn"];

const LEGACY_TO_CORE_CREDENTIAL_TYPE: Record<LegacyCredentialType, CredentialType> = {
  qbcc_licence: "trade_license",
  electrical_licence: "trade_license",
  plumbing_licence: "trade_license",
  public_liability: "trade_license",
  workers_compensation: "trade_license",
  police_check: "trade_license",
  blue_card: "trade_license",
  other_licence: "trade_license",
};

export type CredentialStatus = "pending" | "verified" | "rejected";

export type VerificationConfidence = "high" | "medium" | "low";

export interface VerificationSourceEntry {
  source_name: string;
  source_type: "registry" | "document" | "manual" | "system";
  status: "verified" | "mismatch" | "pending" | "failed";
  checked_at?: string | null;
  evidence_url?: string | null;
  reference_id?: string | null;
  notes?: string | null;
  details?: Record<string, unknown> | null;
}

export interface TrustBadge {
  id: string;
  slug: string;
  business_name: string;
  abn?: string | null;
  status: TrustBadgeStatus;
  verification_confidence?: VerificationConfidence | null;
  verification_sources?: VerificationSourceEntry[] | null;
  last_verified_at?: string | null;
  verification_summary?: string | null;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Credential {
  id: string;
  trustbadge_id: string;
  type: string;
  file_url?: string | null;
  reference_number?: string | null;
  status: CredentialStatus;
  verified_at?: string | null;
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const CREDENTIAL_LABELS: Record<string, string> = {
  trade_license: "Trade Licence",
  qbcc_licence: "QBCC Licence",
  electrical_licence: "Electrical Licence",
  plumbing_licence: "Plumbing Licence",
  public_liability: "Public Liability Insurance",
  workers_compensation: "Workers Compensation Insurance",
  abn: "ABN Registration",
  police_check: "Police Check",
  blue_card: "Blue Card (Working with Children)",
  first_aid: "First Aid Certificate",
  other_licence: "Other Licence / Certificate",
};

export const CREDENTIAL_UPLOAD_OPTIONS: Array<{
  value: CredentialType;
  label: string;
  help: string;
}> = [
  {
    value: "trade_license",
    label: "Trade licence / insurance",
    help: "Use this for licence and insurance documents (QBCC, plumbing, electrical, public liability, workers comp).",
  },
  {
    value: "first_aid",
    label: "First aid certificate",
    help: "Use this for first-aid, safety, and competency certificates.",
  },
  {
    value: "abn",
    label: "ABN registration",
    help: "Use this for ABN proof and business registration documents.",
  },
];

export function normalizeCredentialType(value: string | null | undefined): CredentialType {
  const normalized = (value ?? "").trim().toLowerCase();

  if (CORE_CREDENTIAL_TYPES.includes(normalized as CredentialType)) {
    return normalized as CredentialType;
  }

  if (normalized in LEGACY_TO_CORE_CREDENTIAL_TYPE) {
    return LEGACY_TO_CORE_CREDENTIAL_TYPE[normalized as LegacyCredentialType];
  }

  return "trade_license";
}

export function getCredentialLabel(value: string | null | undefined): string {
  const normalized = (value ?? "").trim().toLowerCase();

  if (normalized && CREDENTIAL_LABELS[normalized]) {
    return CREDENTIAL_LABELS[normalized];
  }

  if (!normalized) {
    return "Credential";
  }

  return normalized
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}
