import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getCurrentAuthUser, isAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function isMissingLeadEventsRelationError(message?: string): boolean {
  if (!message) return false;
  const lowered = message.toLowerCase();
  return lowered.includes("relation") && lowered.includes("lead_events") && lowered.includes("does not exist");
}

function isMissingBusinessProfilesRelationError(message?: string): boolean {
  if (!message) return false;
  const lowered = message.toLowerCase();
  return lowered.includes("relation") && lowered.includes("business_profiles") && lowered.includes("does not exist");
}

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
    const leadType = url.searchParams.get("leadType") || "all";
    const leadStatus = url.searchParams.get("leadStatus") || "all";
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

    let trackedLeads: Array<Record<string, unknown>> = [];
    let trackedLeadSummary = {
      total: 0,
      quoteForm: 0,
      callClick: 0,
      emailClick: 0,
      newStatus: 0,
    };

    let trackedQuery = service
      .from("lead_events")
      .select(
        "id,type,status,source,referrer,name,phone,email,suburb,service_needed,message,metadata,created_at,updated_at,business_profile:business_profiles(slug,business_name,plan,email,phone)"
      )
      .order("created_at", { ascending: false })
      .limit(Math.min(limit, 2000));

    if (leadType !== "all") {
      trackedQuery = trackedQuery.eq("type", leadType);
    }

    if (leadStatus !== "all") {
      trackedQuery = trackedQuery.eq("status", leadStatus);
    }

    if (daysBack > 0 && daysBack < 9999) {
      const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
      trackedQuery = trackedQuery.gte("created_at", since);
    }

    if (search.trim()) {
      trackedQuery = trackedQuery.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,suburb.ilike.%${search}%,service_needed.ilike.%${search}%,message.ilike.%${search}%,source.ilike.%${search}%`
      );
    }

    const { data: trackedData, error: trackedError } = await trackedQuery;

    if (trackedError) {
      const missingTables =
        isMissingLeadEventsRelationError(trackedError.message) ||
        isMissingBusinessProfilesRelationError(trackedError.message);

      if (!missingTables) {
        return NextResponse.json({ error: trackedError.message }, { status: 500 });
      }
    } else if (trackedData) {
      trackedLeads = trackedData as Array<Record<string, unknown>>;
      trackedLeadSummary = {
        total: trackedLeads.length,
        quoteForm: trackedLeads.filter((lead) => lead.type === "quote_form").length,
        callClick: trackedLeads.filter((lead) => lead.type === "call_click").length,
        emailClick: trackedLeads.filter((lead) => lead.type === "email_click").length,
        newStatus: trackedLeads.filter((lead) => lead.status === "new").length,
      };
    }

    return NextResponse.json({
      success: true,
      leads: data ?? [],
      trackedLeads,
      trackedLeadSummary,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
