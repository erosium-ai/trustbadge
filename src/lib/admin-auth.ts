import { getServerClient } from "@/lib/supabase-server";
import { getServiceClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const ADMIN_ROLE_NAMES = ["review_admin", "super_admin", "admin"];

function parseAdminEmails(raw: string | undefined): Set<string> {
  if (!raw) return new Set<string>();
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function envAllowlistHas(email: string): boolean {
  const admins = parseAdminEmails(process.env.TRUSTBADGE_ADMIN_EMAILS);
  if (admins.size === 0) return false;
  return admins.has(normalizeEmail(email));
}

function extractUserRoles(user: User): string[] {
  const appMetadata = user.app_metadata ?? {};
  const userMetadata = user.user_metadata ?? {};

  const roles = [
    appMetadata.role,
    ...(Array.isArray(appMetadata.roles) ? appMetadata.roles : []),
    userMetadata.role,
    ...(Array.isArray(userMetadata.roles) ? userMetadata.roles : []),
  ]
    .map((value) => (typeof value === "string" ? value.trim().toLowerCase() : ""))
    .filter(Boolean);

  return [...new Set(roles)];
}

function userHasClaimAdminRole(user: User): boolean {
  const roles = extractUserRoles(user);
  return roles.some((role) => ADMIN_ROLE_NAMES.includes(role));
}

function isMissingAdminRolesTableError(message?: string): boolean {
  if (!message) return false;
  const lowered = message.toLowerCase();
  return lowered.includes("relation") && lowered.includes("admin_roles") && lowered.includes("does not exist");
}

async function userHasDbAdminRole(email: string): Promise<boolean | null> {
  const service = getServiceClient();
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await service
    .from("admin_roles")
    .select("email")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .in("role", ADMIN_ROLE_NAMES)
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingAdminRolesTableError(error.message)) {
      return null;
    }
    return false;
  }

  return Boolean(data);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return envAllowlistHas(email);
}

export async function isAdminUser(user: User | null | undefined): Promise<boolean> {
  if (!user || !user.email) return false;

  if (userHasClaimAdminRole(user)) {
    return true;
  }

  const dbRole = await userHasDbAdminRole(user.email);
  if (dbRole === true) {
    return true;
  }

  // Transitional fallback for continuity while admin_roles rollout completes.
  if (dbRole === null) {
    return envAllowlistHas(user.email);
  }

  // Table exists and user is not explicitly granted.
  return false;
}

export async function getCurrentAuthUser() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
