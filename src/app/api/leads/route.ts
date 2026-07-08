import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getCurrentAuthUser, isAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentAuthUser();
    if (!user || !(await isAdminUser(user))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const hasEmail = url.searchParams.get("hasEmail") || "all";
    const daysBack = parseInt(url.searchParams.get("daysBack") || "9999", 10);
    const limit = parseInt(url.searchParams.get("limit") || "500", 10);

    const service = getServiceClient();
    let query = service
      .from("pages")
      .select("id,slug,business_name,tagline,description,creator_email,contact_email,contact_phone,website_url,location_address,brand_color,created_at,updated_at,services,social_links")
      .order("created_at", { ascending: false })
      .limit(Math.min(limit, 2000));

    if (search.trim()) {
      query = query.or(`business_name.ilike.%${search}%,slug.ilike.%${search}%,location_address.ilike.%${search}%`);
    }

    if (hasEmail === "yes") {
      query = query.not("creator_email", "is", null);
    } else if (hasEmail === "no") {
      query = query.is("creator_email", null);
    }

    if (daysBack > 0 && daysBack < 9999) {
      const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", since);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, leads: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
