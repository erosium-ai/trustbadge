import { getServerClient } from "@/lib/supabase-server";

function parseAdminEmails(raw: string | undefined): Set<string> {
  if (!raw) return new Set<string>();
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = parseAdminEmails(process.env.TRUSTBADGE_ADMIN_EMAILS);
  if (admins.size === 0) return false;
  return admins.has(email.trim().toLowerCase());
}

export async function getCurrentAuthUser() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

