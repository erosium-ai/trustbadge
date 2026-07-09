// 🔑 Keywords: Credentials AI primary business, dashboard nav resolver, api me
// Returns the primary business slug for the current authenticated user, used
// by the TopBar to build Dashboard/Leads/Verification links without a
// full-page reload.

import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";
import { getPrimaryBusinessForUser } from "@/lib/dashboard-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ slug: null }, { status: 200 });
  }
  const primary = await getPrimaryBusinessForUser(user.id);
  if (!primary) {
    return NextResponse.json({ slug: null }, { status: 200 });
  }
  return NextResponse.json({
    slug: primary.slug,
    business_name: primary.business_name,
    plan: primary.plan,
    founding_number: primary.founding_number,
  });
}
