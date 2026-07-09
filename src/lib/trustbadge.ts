"use server";

import { sanitizeSlug } from "./slug";
import { getServiceClient } from "./supabase";
import { verifyAbn } from "./abn";
import type {
  Credential,
  CredentialType,
  TrustBadge,
  VerificationSourceEntry,
  VerificationConfidence,
} from "./types";
import { normalizeCredentialType } from "./types";

type ReviewBadge = Pick<TrustBadge, "id" | "slug" | "business_name" | "status">;

export interface ReviewCredential extends Credential {
  trustbadge: ReviewBadge | null;
}

export interface ReviewActivity {
  credential: Credential;
  trustbadge: ReviewBadge | null;
  decision: "verified" | "rejected";
  reviewedAt: string;
  reviewerEmail: string | null;
  note: string | null;
}

interface ReviewEventRow {
  id: string;
  credential_id: string;
  trustbadge_id: string;
  decision: "verified" | "rejected";
  reviewer_email: string | null;
  note: string | null;
  reviewed_at: string;
  created_at?: string;
}

interface ConversionEventRow {
  id: string;
  event_name: string;
  source: string | null;
  campaign: string | null;
  occurred_at: string;
  metadata: Record<string, unknown> | null;
}

export interface ConversionEventSummary {
  eventName: string;
  count: number;
}

export interface ConversionEventActivity {
  id: string;
  eventName: string;
  source: string | null;
  campaign: string | null;
  occurredAt: string;
  metadata: Record<string, unknown>;
}

interface ReviewDecisionInput {
  credentialId: string;
  status: "verified" | "rejected";
  adminNotes?: string;
  reviewerEmail?: string;
  expectedTrustbadgeId?: string;
  expectedCredentialType?: CredentialType | string;
  expectedCreatedAt?: string;
}

export interface ConversionTrackingInput {
  source?: string | null;
  sourceSlug?: string | null;
  campaign?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
}

export interface BusinessProfile {
  id: string;
  owner_user_id?: string | null;
  source_page_id?: string | null;
  trustbadge_id?: string | null;
  slug: string;
  business_name: string;
  abn?: string | null;
  abn_status?: string | null;
  category?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  service_areas?: unknown;
  services?: unknown;
  social_links?: unknown;
  plan?: string | null;
  verification_level?: number | null;
  booking_url?: string | null;
  logo_url?: string | null;
  hero_image_url?: string | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

function confidenceRank(level: VerificationConfidence): number {
  if (level === "high") return 3;
  if (level === "medium") return 2;
  return 1;
}

function deriveTrustBadgeVerificationState(
  credentials: Array<Pick<Credential, "status">>,
  existingSources: VerificationSourceEntry[]
): {
  confidence: VerificationConfidence;
  sources: VerificationSourceEntry[];
  summary: string;
  lastVerifiedAt: string;
} {
  const now = new Date().toISOString();

  const verifiedCount = credentials.filter((credential) => credential.status === "verified").length;
  const pendingCount = credentials.filter((credential) => credential.status === "pending").length;
  const rejectedCount = credentials.filter((credential) => credential.status === "rejected").length;

  const documentStatus: VerificationSourceEntry["status"] =
    verifiedCount > 0
      ? "verified"
      : pendingCount > 0
        ? "pending"
        : rejectedCount > 0
          ? "failed"
          : "pending";

  const documentSource: VerificationSourceEntry = {
    source_name: "Credential document review",
    source_type: "manual",
    status: documentStatus,
    checked_at: now,
    notes:
      verifiedCount > 0
        ? `${verifiedCount} verified credential(s)`
        : pendingCount > 0
          ? `${pendingCount} credential(s) pending admin review`
          : rejectedCount > 0
            ? `${rejectedCount} credential(s) rejected`
            : "No credential documents uploaded yet",
    details: {
      verifiedCount,
      pendingCount,
      rejectedCount,
    },
  };

  const mergedSources = [
    ...existingSources.filter((source) => source.source_name !== documentSource.source_name),
    documentSource,
  ];

  const hasVerifiedRegistry = mergedSources.some(
    (source) => source.source_type === "registry" && source.status === "verified"
  );
  const hasVerifiedDocument = mergedSources.some(
    (source) => source.source_name === documentSource.source_name && source.status === "verified"
  );
  const hasPendingSignals = mergedSources.some((source) => source.status === "pending");
  const hasFailures = mergedSources.some((source) => source.status === "failed" || source.status === "mismatch");

  let confidence: VerificationConfidence = "low";
  if (hasVerifiedRegistry && hasVerifiedDocument) {
    confidence = "high";
  } else if (hasVerifiedRegistry || hasVerifiedDocument || hasPendingSignals) {
    confidence = "medium";
  }

  const summaryParts: string[] = [];
  if (hasVerifiedRegistry) {
    summaryParts.push("registry checks passed");
  }
  if (hasVerifiedDocument) {
    summaryParts.push("credential documents verified");
  } else if (hasPendingSignals) {
    summaryParts.push("credential review in progress");
  }
  if (hasFailures) {
    summaryParts.push("some checks require attention");
  }

  const summary = summaryParts.length > 0 ? summaryParts.join("; ") : "Verification checks not yet completed";

  return {
    confidence,
    sources: mergedSources,
    summary,
    lastVerifiedAt: now,
  };
}

const REVIEW_META_PREFIX = "[review-meta]";

function buildReviewNotes(
  decision: "verified" | "rejected",
  reviewedAt: string,
  reviewerEmail?: string,
  freeformNote?: string
): string {
  const meta = `${REVIEW_META_PREFIX} reviewer=${reviewerEmail?.trim() || "unknown"}; decision=${decision}; at=${reviewedAt}`;
  const note = freeformNote?.trim();
  return note ? `${meta}\n${note}` : meta;
}

function parseReviewNotes(
  raw: string | null | undefined,
  fallbackAt: string,
  fallbackDecision: "verified" | "rejected"
): { reviewerEmail: string | null; reviewedAt: string; note: string | null; decision: "verified" | "rejected" } {
  if (!raw || !raw.startsWith(REVIEW_META_PREFIX)) {
    return {
      reviewerEmail: null,
      reviewedAt: fallbackAt,
      note: raw?.trim() || null,
      decision: fallbackDecision,
    };
  }

  const [metaLine, ...rest] = raw.split("\n");
  const meta = metaLine.replace(REVIEW_META_PREFIX, "").trim();
  const chunks = meta.split(";").map((part) => part.trim());

  const valueOf = (key: string) => {
    const entry = chunks.find((part) => part.startsWith(`${key}=`));
    if (!entry) return null;
    return entry.slice(key.length + 1).trim() || null;
  };

  const reviewer = valueOf("reviewer");
  const at = valueOf("at");
  const parsedDecision = valueOf("decision");
  const note = rest.join("\n").trim() || null;

  return {
    reviewerEmail: reviewer && reviewer !== "unknown" ? reviewer : null,
    reviewedAt: at || fallbackAt,
    note,
    decision: parsedDecision === "rejected" ? "rejected" : "verified",
  };
}

function isMissingRelationError(message?: string): boolean {
  if (!message) return false;
  const lowered = message.toLowerCase();
  return lowered.includes("relation") && lowered.includes("review_events") && lowered.includes("does not exist");
}

function isMissingConversionEventsRelationError(message?: string): boolean {
  if (!message) return false;
  const lowered = message.toLowerCase();
  return lowered.includes("relation") && lowered.includes("conversion_events") && lowered.includes("does not exist");
}

function isMissingBusinessProfilesRelationError(message?: string): boolean {
  if (!message) return false;
  const lowered = message.toLowerCase();
  return lowered.includes("relation") && lowered.includes("business_profiles") && lowered.includes("does not exist");
}

function isMissingTrustBadgeVerificationColumnError(message?: string): boolean {
  if (!message) return false;
  const lowered = message.toLowerCase();
  return (
    lowered.includes("verification_confidence") ||
    lowered.includes("verification_sources") ||
    lowered.includes("last_verified_at") ||
    lowered.includes("verification_summary")
  );
}

async function recomputeTrustBadgeStatus(trustbadgeId: string): Promise<void> {
  const serviceClient = getServiceClient();

  const { data, error } = await serviceClient
    .from("credentials")
    .select("status")
    .eq("trustbadge_id", trustbadgeId);

  if (error) return;

  const statuses = (data ?? []).map((row: { status: Credential["status"] }) => row.status);

  let nextStatus: TrustBadge["status"] = "draft";
  if (statuses.includes("verified")) {
    nextStatus = "verified";
  } else if (statuses.includes("pending")) {
    nextStatus = "pending_review";
  } else if (statuses.length > 0) {
    nextStatus = "rejected";
  }

  await serviceClient
    .from("trustbadges")
    .update({ status: nextStatus })
    .eq("id", trustbadgeId);
}

// ---------------------------------------------------------------------------
// Public / shared helpers
// ---------------------------------------------------------------------------

export async function getTrustBadgeBySlug(
  slug: string
): Promise<TrustBadge | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("trustbadges")
    .select("*")
    .eq("slug", sanitizeSlug(slug))
    .single();

  if (error || !data) return null;
  return data as TrustBadge;
}

export async function getCredentialsByTrustBadgeId(
  trustbadgeId: string
): Promise<Credential[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("trustbadge_id", trustbadgeId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Credential[];
}

export async function getPublicBadgeData(slug: string): Promise<{
  trustbadge: TrustBadge | null;
  credentials: Credential[];
}> {
  const trustbadge = await getTrustBadgeBySlug(slug);
  if (!trustbadge) {
    return { trustbadge: null, credentials: [] };
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("trustbadge_id", trustbadge.id)
    .eq("status", "verified")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { trustbadge, credentials: [] };
  }

  return { trustbadge, credentials: data as Credential[] };
}

export async function getBusinessProfileBySlug(slug: string): Promise<BusinessProfile | null> {
  const normalizedSlug = sanitizeSlug(slug);
  if (!normalizedSlug) return null;

  const serviceClient = getServiceClient();
  const { data, error } = await serviceClient
    .from("business_profiles")
    .select("*")
    .eq("slug", normalizedSlug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    if (!isMissingBusinessProfilesRelationError(error.message)) {
      console.error("[business-profile] fetch failed", {
        slug: normalizedSlug,
        message: error.message,
        code: error.code,
      });
    }
    return null;
  }

  return (data as BusinessProfile | null) ?? null;
}

// ---------------------------------------------------------------------------
// Server-only helpers (service role or authenticated flows)
// ---------------------------------------------------------------------------

export async function createTrustBadge(
  userId: string,
  businessName: string,
  abn?: string,
  tracking?: ConversionTrackingInput
): Promise<{ success: boolean; trustbadge?: TrustBadge; error?: string }> {
  const slug = sanitizeSlug(businessName);
  if (!slug) {
    return { success: false, error: "Invalid business name for slug" };
  }

  const serviceClient = getServiceClient();

  const initialSources: VerificationSourceEntry[] = [
    {
      source_name: "Credential document review",
      source_type: "manual",
      status: "pending",
      checked_at: new Date().toISOString(),
      notes: "No credentials uploaded yet",
    },
  ];

  if (abn?.trim()) {
    const abnVerification = await verifyAbn(abn, businessName);
    initialSources.push({
      source_name: abnVerification.source,
      source_type: "registry",
      status:
        abnVerification.status === "verified"
          ? "verified"
          : abnVerification.status === "verified_name_mismatch"
            ? "mismatch"
            : abnVerification.status === "checksum_valid_unverified"
              ? "pending"
              : "failed",
      checked_at: abnVerification.checkedAt,
      notes: abnVerification.message,
      reference_id: abnVerification.normalizedAbn || undefined,
      details: {
        status: abnVerification.status,
        confidence: abnVerification.confidence,
        matchedBusinessName: abnVerification.matchedBusinessName ?? null,
        abrStatus: abnVerification.abrStatus ?? null,
      },
    });
  }

  const initialConfidence: VerificationConfidence = initialSources.reduce<VerificationConfidence>((current, source) => {
    const candidate: VerificationConfidence =
      source.status === "verified"
        ? "high"
        : source.status === "pending"
          ? "medium"
          : "low";
    return confidenceRank(candidate) > confidenceRank(current) ? candidate : current;
  }, "low");

  const initialSummary = initialSources
    .map((source) => `${source.source_name}: ${source.notes ?? source.status}`)
    .join(" | ");

  const insertPayload = {
    user_id: userId,
    slug,
    business_name: businessName,
    abn,
    verification_confidence: initialConfidence,
    verification_sources: initialSources,
    last_verified_at: new Date().toISOString(),
    verification_summary: initialSummary,
  };

  let { data, error } = await serviceClient
    .from("trustbadges")
    .insert(insertPayload)
    .select()
    .single();

  if (error && isMissingTrustBadgeVerificationColumnError(error.message)) {
    const fallbackInsert = await serviceClient
      .from("trustbadges")
      .insert({
        user_id: userId,
        slug,
        business_name: businessName,
        abn,
      })
      .select()
      .single();

    data = fallbackInsert.data;
    error = fallbackInsert.error;
  }

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Business name / slug already exists" };
    }
    return { success: false, error: error.message };
  }

  const hasTracking =
    Boolean(tracking?.source) ||
    Boolean(tracking?.sourceSlug) ||
    Boolean(tracking?.campaign) ||
    Boolean(tracking?.utmSource) ||
    Boolean(tracking?.utmMedium) ||
    Boolean(tracking?.utmCampaign) ||
    Boolean(tracking?.utmContent);

  if (hasTracking) {
    const now = new Date().toISOString();

    const { error: conversionError } = await serviceClient
      .from("conversion_events")
      .insert({
        event_name: "credentials_ai_register_success",
        trustbadge_id: (data as TrustBadge).id,
        user_id: userId,
        source: tracking?.source?.trim() || null,
        source_slug: tracking?.sourceSlug?.trim() || null,
        campaign: tracking?.campaign?.trim() || null,
        utm_source: tracking?.utmSource?.trim() || null,
        utm_medium: tracking?.utmMedium?.trim() || null,
        utm_campaign: tracking?.utmCampaign?.trim() || null,
        utm_content: tracking?.utmContent?.trim() || null,
        metadata: {
          trustbadge_slug: (data as TrustBadge).slug,
          business_name: (data as TrustBadge).business_name,
        },
        occurred_at: now,
      });

    if (conversionError && !isMissingConversionEventsRelationError(conversionError.message)) {
      console.error("[conversion_events] insert failed", {
        message: conversionError.message,
        code: conversionError.code,
        details: conversionError.details,
      });
    }
  }

  return { success: true, trustbadge: data as TrustBadge };
}

export async function getTrustBadgeBySlugAdmin(
  slug: string
): Promise<TrustBadge | null> {
  const serviceClient = getServiceClient();
  const { data, error } = await serviceClient
    .from("trustbadges")
    .select("*")
    .eq("slug", sanitizeSlug(slug))
    .single();

  if (error || !data) return null;
  return data as TrustBadge;
}

export async function uploadCredential(
  trustbadgeId: string,
  type: CredentialType,
  file: File,
  referenceNumber?: string
): Promise<{ success: boolean; credential?: Credential; error?: string }> {
  const serviceClient = getServiceClient();
  const safeType = normalizeCredentialType(type);

  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `${trustbadgeId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await serviceClient.storage
    .from("trustbadge-creds")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data: urlData } = serviceClient.storage
    .from("trustbadge-creds")
    .getPublicUrl(path);

  const insertPayload: Record<string, unknown> = {
    trustbadge_id: trustbadgeId,
    type: safeType,
    file_url: urlData.publicUrl,
    status: "pending",
  };
  if (referenceNumber?.trim()) {
    insertPayload.reference_number = referenceNumber.trim();
  }

  const { data, error } = await serviceClient
    .from("credentials")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    const msg = error.message?.toLowerCase() || "";
    const isMissingRefColumn = msg.includes("reference_number") || msg.includes("column") || msg.includes("does not exist");
    if (isMissingRefColumn && referenceNumber?.trim()) {
      const { data: retryData, error: retryError } = await serviceClient
        .from("credentials")
        .insert({
          trustbadge_id: trustbadgeId,
          type: safeType,
          file_url: urlData.publicUrl,
          status: "pending",
        })
        .select()
        .single();
      if (!retryError) {
        return { success: true, credential: retryData as Credential };
      }
    }
    return { success: false, error: error.message };
  }

  await recomputeTrustBadgeStatus(trustbadgeId);

  return { success: true, credential: data as Credential };
}

export async function getPendingCredentialsForReview(): Promise<ReviewCredential[]> {
  const serviceClient = getServiceClient();

  const { data: credentials, error } = await serviceClient
    .from("credentials")
    .select("id, trustbadge_id, type, file_url, reference_number, status, verified_at, admin_notes, created_at, updated_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error || !credentials || credentials.length === 0) return [];

  const trustbadgeIds = [...new Set(credentials.map((c: { trustbadge_id: string }) => c.trustbadge_id))];

  const { data: badges } = await serviceClient
    .from("trustbadges")
    .select("id, slug, business_name, status")
    .in("id", trustbadgeIds);

  const badgeMap = new Map<string, ReviewBadge>(
    (badges ?? []).map((badge: ReviewBadge) => [badge.id, badge])
  );

  return credentials.map((credential: Credential) => ({
    ...(credential as Credential),
    trustbadge: badgeMap.get(credential.trustbadge_id) ?? null,
  }));
}

export async function setCredentialReviewStatus({
  credentialId,
  status,
  adminNotes,
  reviewerEmail,
  expectedTrustbadgeId,
  expectedCredentialType,
  expectedCreatedAt,
}: ReviewDecisionInput): Promise<{ success: boolean; error?: string; trustbadgeId?: string }> {
  const serviceClient = getServiceClient();
  const reviewedAt = new Date().toISOString();
  const cleanAdminNote = adminNotes?.trim() || null;

  const updatePayload: {
    status: "verified" | "rejected";
    admin_notes: string | null;
    verified_at: string | null;
  } = {
    status,
    admin_notes: cleanAdminNote,
    verified_at: status === "verified" ? reviewedAt : null,
  };

  let updateQuery = serviceClient
    .from("credentials")
    .update(updatePayload)
    .eq("id", credentialId)
    .eq("status", "pending");

  if (expectedTrustbadgeId) {
    updateQuery = updateQuery.eq("trustbadge_id", expectedTrustbadgeId);
  }

  if (expectedCredentialType) {
    updateQuery = updateQuery.eq("type", expectedCredentialType);
  }

  if (expectedCreatedAt) {
    updateQuery = updateQuery.eq("created_at", expectedCreatedAt);
  }

  const { data, error } = await updateQuery
    .select("id, trustbadge_id")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "Credential already reviewed or no longer matches the expected queue item",
    };
  }

  const trustbadgeId = (data as { trustbadge_id: string }).trustbadge_id;

  const { error: reviewEventError } = await serviceClient
    .from("review_events")
    .insert({
      credential_id: credentialId,
      trustbadge_id: trustbadgeId,
      decision: status,
      reviewer_email: reviewerEmail?.trim() || null,
      note: cleanAdminNote,
      reviewed_at: reviewedAt,
    });

  if (reviewEventError && isMissingRelationError(reviewEventError.message)) {
    // Transitional fallback: keep machine-readable metadata in admin_notes
    // until the review_events migration is applied in production.
    const fallbackNotes = buildReviewNotes(
      status,
      reviewedAt,
      reviewerEmail,
      cleanAdminNote ?? undefined
    );

    await serviceClient
      .from("credentials")
      .update({ admin_notes: fallbackNotes })
      .eq("id", credentialId);
  } else if (reviewEventError) {
    return { success: false, error: reviewEventError.message };
  }

  await recomputeTrustBadgeStatus(trustbadgeId);

  const { data: trustbadgeRow } = await serviceClient
    .from("trustbadges")
    .select("verification_sources")
    .eq("id", trustbadgeId)
    .maybeSingle();

  const existingSources = (trustbadgeRow?.verification_sources as VerificationSourceEntry[] | null) ?? [];

  const { data: badgeCredentials } = await serviceClient
    .from("credentials")
    .select("status")
    .eq("trustbadge_id", trustbadgeId);

  const derived = deriveTrustBadgeVerificationState(
    (badgeCredentials ?? []) as Array<Pick<Credential, "status">>,
    existingSources
  );

  const { error: trustbadgeVerificationUpdateError } = await serviceClient
    .from("trustbadges")
    .update({
      verification_confidence: derived.confidence,
      verification_sources: derived.sources,
      verification_summary: derived.summary,
      last_verified_at: derived.lastVerifiedAt,
    })
    .eq("id", trustbadgeId);

  if (
    trustbadgeVerificationUpdateError &&
    !isMissingTrustBadgeVerificationColumnError(trustbadgeVerificationUpdateError.message)
  ) {
    return { success: false, error: trustbadgeVerificationUpdateError.message };
  }

  return { success: true, trustbadgeId };
}

async function getReviewHistoryFromCredentialNotes(limit: number): Promise<ReviewActivity[]> {
  const serviceClient = getServiceClient();
  const fetchLimit = Math.max(limit * 3, 100);

  const { data: credentials, error } = await serviceClient
    .from("credentials")
    .select("id, trustbadge_id, type, file_url, reference_number, status, verified_at, admin_notes, created_at, updated_at")
    .in("status", ["verified", "rejected"])
    .order("created_at", { ascending: false })
    .limit(fetchLimit);

  if (error || !credentials || credentials.length === 0) return [];

  const trustbadgeIds = [...new Set(credentials.map((c: { trustbadge_id: string }) => c.trustbadge_id))];

  const { data: badges } = await serviceClient
    .from("trustbadges")
    .select("id, slug, business_name, status")
    .in("id", trustbadgeIds);

  const badgeMap = new Map<string, ReviewBadge>(
    (badges ?? []).map((badge: ReviewBadge) => [badge.id, badge])
  );

  return credentials
    .map((row: Credential) => {
      if (row.status !== "verified" && row.status !== "rejected") return null;

      const fallbackAt = row.verified_at || row.updated_at || row.created_at || new Date().toISOString();
      const parsed = parseReviewNotes(row.admin_notes, fallbackAt, row.status);

      return {
        credential: row,
        trustbadge: badgeMap.get(row.trustbadge_id) ?? null,
        decision: parsed.decision,
        reviewedAt: parsed.reviewedAt,
        reviewerEmail: parsed.reviewerEmail,
        note: parsed.note,
      } satisfies ReviewActivity;
    })
    .filter((item): item is ReviewActivity => Boolean(item))
    .sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime())
    .slice(0, limit);
}

export async function getReviewHistory(limit = 50): Promise<ReviewActivity[]> {
  const serviceClient = getServiceClient();

  const { data: events, error: eventsError } = await serviceClient
    .from("review_events")
    .select("id, credential_id, trustbadge_id, decision, reviewer_email, note, reviewed_at, created_at")
    .order("reviewed_at", { ascending: false })
    .limit(limit);

  if (eventsError) {
    return getReviewHistoryFromCredentialNotes(limit);
  }

  const reviewEvents = (events ?? []) as ReviewEventRow[];

  if (reviewEvents.length === 0) {
    return getReviewHistoryFromCredentialNotes(limit);
  }

  const credentialIds = [...new Set(reviewEvents.map((event) => event.credential_id))];
  const trustbadgeIds = [...new Set(reviewEvents.map((event) => event.trustbadge_id))];

  const [{ data: credentials }, { data: badges }] = await Promise.all([
    serviceClient
      .from("credentials")
      .select("id, trustbadge_id, type, file_url, reference_number, status, verified_at, admin_notes, created_at, updated_at")
      .in("id", credentialIds),
    serviceClient
      .from("trustbadges")
      .select("id, slug, business_name, status")
      .in("id", trustbadgeIds),
  ]);

  const credentialMap = new Map<string, Credential>(
    (credentials ?? []).map((credential: Credential) => [credential.id, credential])
  );
  const badgeMap = new Map<string, ReviewBadge>(
    (badges ?? []).map((badge: ReviewBadge) => [badge.id, badge])
  );

  const eventActivities = reviewEvents
    .map((event) => {
      const credential = credentialMap.get(event.credential_id);
      if (!credential) return null;

      return {
        credential,
        trustbadge: badgeMap.get(event.trustbadge_id) ?? null,
        decision: event.decision,
        reviewedAt: event.reviewed_at,
        reviewerEmail: event.reviewer_email,
        note: event.note,
      } satisfies ReviewActivity;
    })
    .filter((item): item is ReviewActivity => Boolean(item));

  // Include legacy history items (saved in credential notes) that predate review_events.
  const legacyHistory = await getReviewHistoryFromCredentialNotes(limit);
  const seenCredentialIds = new Set(eventActivities.map((item) => item.credential.id));
  const merged = [
    ...eventActivities,
    ...legacyHistory.filter((item) => !seenCredentialIds.has(item.credential.id)),
  ];

  return merged
    .sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime())
    .slice(0, limit);
}

export async function getConversionEventSummary(days = 7): Promise<ConversionEventSummary[]> {
  const serviceClient = getServiceClient();
  const safeDays = Math.max(1, Math.min(90, Math.trunc(days)));
  const sinceIso = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await serviceClient
    .from("conversion_events")
    .select("event_name, occurred_at")
    .gte("occurred_at", sinceIso)
    .order("occurred_at", { ascending: false })
    .limit(5000);

  if (error) {
    if (isMissingConversionEventsRelationError(error.message)) {
      return [];
    }

    console.error("[conversion_events] summary query failed", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ event_name: string }>) {
    const key = row.event_name?.trim() || "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([eventName, count]) => ({ eventName, count }))
    .sort((a, b) => b.count - a.count || a.eventName.localeCompare(b.eventName));
}

export async function getRecentConversionEvents(limit = 30): Promise<ConversionEventActivity[]> {
  const serviceClient = getServiceClient();
  const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit)));

  const { data, error } = await serviceClient
    .from("conversion_events")
    .select("id, event_name, source, campaign, occurred_at, metadata")
    .order("occurred_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    if (isMissingConversionEventsRelationError(error.message)) {
      return [];
    }

    console.error("[conversion_events] recent query failed", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return [];
  }

  return ((data ?? []) as ConversionEventRow[]).map((row) => ({
    id: row.id,
    eventName: row.event_name,
    source: row.source,
    campaign: row.campaign,
    occurredAt: row.occurred_at,
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
  }));
}

export async function getOwnerTrustBadgeBySlug(
  slug: string,
  userId: string
): Promise<TrustBadge | null> {
  const serviceClient = getServiceClient();
  const { data, error } = await serviceClient
    .from("trustbadges")
    .select("*")
    .eq("slug", sanitizeSlug(slug))
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data as TrustBadge;
}

export async function getCredentialsForOwner(
  trustbadgeId: string
): Promise<Credential[]> {
  const serviceClient = getServiceClient();
  const { data, error } = await serviceClient
    .from("credentials")
    .select("*")
    .eq("trustbadge_id", trustbadgeId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Credential[];
}
