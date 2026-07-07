export type TrustBadgeStatus =
  | "draft"
  | "pending_review"
  | "verified"
  | "rejected"
  | "suspended";

export type CredentialType =
  | "trade_license"
  | "qbcc_licence"
  | "electrical_licence"
  | "plumbing_licence"
  | "public_liability"
  | "workers_compensation"
  | "abn"
  | "police_check"
  | "blue_card"
  | "first_aid"
  | "other_licence";

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
  type: CredentialType;
  file_url?: string | null;
  reference_number?: string | null;
  status: CredentialStatus;
  verified_at?: string | null;
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const CREDENTIAL_LABELS: Record<CredentialType, string> = {
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
