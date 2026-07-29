// 🔑 Keywords: Credentials AI dashboard resolver, dashboard entrypoint
// Resolver page. Sends the logged-in user to their primary business
// dashboard. Not logged in -> /auth/login. No business -> /auth/register.

import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";
import { getPrimaryBusinessForUser } from "@/lib/dashboard-queries";

export const dynamic = "force-dynamic";

interface DashboardResolverProps {
  searchParams: Promise<{ billing?: string; requested_slug?: string }>;
}

export default async function DashboardResolver({ searchParams }: DashboardResolverProps) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  const primary = await getPrimaryBusinessForUser(user.id);
  if (!primary) {
    redirect("/dashboard/no-business");
  }

  const search = await searchParams;
  const query = new URLSearchParams();
  if (search.billing) query.set("billing", search.billing);
  if (search.requested_slug) query.set("requested_slug", search.requested_slug);
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  redirect(`/dashboard/${primary.slug}${suffix}`);
}
