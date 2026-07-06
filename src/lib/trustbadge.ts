"use server";

import { sanitizeSlug } from "./slug";
import { getServiceClient } from "./supabase";
import type { Credential, CredentialType, TrustBadge } from "./types";

type ReviewBadge = Pick<TrustBadge, "id" | "slug" | "business_name" | "status">;

export interface ReviewCredential extends Credential {
  trustbadge: ReviewBadge | null;
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

// ---------------------------------------------------------------------------
// Server-only helpers (service role or authenticated flows)
// ---------------------------------------------------------------------------

export async function createTrustBadge(
  userId: string,
  businessName: string,
  abn?: string
): Promise<{ success: boolean; trustbadge?: TrustBadge; error?: string }> {
  const slug = sanitizeSlug(businessName);
  if (!slug) {
    return { success: false, error: "Invalid business name for slug" };
  }

  const serviceClient = getServiceClient();
  const { data, error } = await serviceClient
    .from("trustbadges")
    .insert({ user_id: userId, slug, business_name: businessName, abn })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Business name / slug already exists" };
    }
    return { success: false, error: error.message };
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
  file: File
): Promise<{ success: boolean; credential?: Credential; error?: string }> {
  const serviceClient = getServiceClient();

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

  const { data, error } = await serviceClient
    .from("credentials")
    .insert({
      trustbadge_id: trustbadgeId,
      type,
      file_url: urlData.publicUrl,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await recomputeTrustBadgeStatus(trustbadgeId);

  return { success: true, credential: data as Credential };
}

export async function getPendingCredentialsForReview(): Promise<ReviewCredential[]> {
  const serviceClient = getServiceClient();

  const { data: credentials, error } = await serviceClient
    .from("credentials")
    .select("id, trustbadge_id, type, file_url, status, verified_at, admin_notes, created_at, updated_at")
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

export async function setCredentialReviewStatus(
  credentialId: string,
  status: "verified" | "rejected",
  adminNotes?: string
): Promise<{ success: boolean; error?: string; trustbadgeId?: string }> {
  const serviceClient = getServiceClient();

  const updatePayload: {
    status: "verified" | "rejected";
    admin_notes: string | null;
    verified_at: string | null;
  } = {
    status,
    admin_notes: adminNotes?.trim() || null,
    verified_at: status === "verified" ? new Date().toISOString() : null,
  };

  const { data, error } = await serviceClient
    .from("credentials")
    .update(updatePayload)
    .eq("id", credentialId)
    .select("id, trustbadge_id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Credential update failed" };
  }

  const trustbadgeId = (data as { trustbadge_id: string }).trustbadge_id;
  await recomputeTrustBadgeStatus(trustbadgeId);

  return { success: true, trustbadgeId };
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
