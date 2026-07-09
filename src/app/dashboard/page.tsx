// 🔑 Keywords: Credentials AI dashboard resolver, dashboard entrypoint
// Resolver page. Sends the logged-in user to their primary business
// dashboard. Not logged in -> /auth/login. No business -> /auth/register.

import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase-server";
import { getPrimaryBusinessForUser } from "@/lib/dashboard-queries";

export const dynamic = "force-dynamic";

export default async function DashboardResolver() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  const primary = await getPrimaryBusinessForUser(user.id);
  if (!primary) {
    redirect("/auth/register?reason=no_business");
  }
  redirect(`/dashboard/${primary.slug}`);
}
