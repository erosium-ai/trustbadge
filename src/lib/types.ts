export type TrustBadgeStatus =
  | "draft"
  | "pending_review"
  | "verified"
  | "rejected"
  | "suspended";

export type CredentialType =
  | "trade_license"
  | "public_liability"
  | "abn"
  | "police_check"
  | "first_aid";

export type CredentialStatus = "pending" | "verified" | "rejected";

export interface TrustBadge {
  id: string;
  slug: string;
  business_name: string;
  abn?: string | null;
  status: TrustBadgeStatus;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Credential {
  id: string;
  trustbadge_id: string;
  type: CredentialType;
  file_url?: string | null;
  status: CredentialStatus;
  verified_at?: string | null;
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const CREDENTIAL_LABELS: Record<CredentialType, string> = {
  trade_license: "Trade Licence",
  public_liability: "Public Liability Insurance",
  abn: "ABN Registration",
  police_check: "Police Check",
  first_aid: "First Aid Certificate",
};
