import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getCurrentAuthUser, isAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const ALLOWED_LEAD_STATUSES = new Set([
  "new",
  "contacted",
  "quoted",
  "won",
  "lost",
  "spam",
]);

interface WeeklyProofSummary {
  windowDays: number;
  totalEvents: number;
  quoteForms: number;
  callClicks: number;
  emailClicks: number;
  newStatus: number;
  contacted: number;
  quoted: number;
  won: number;
  lost: number;
  spam: number;
  latestLeadAt: string | null;
  topSources: Array<{ source: string; count: number }>;
}

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
    let weeklyProofSummary: WeeklyProofSummary = {
      windowDays: 7,
      totalEvents: 0,
      quoteForms: 0,
      callClicks: 0,
      emailClicks: 0,
      newStatus: 0,
      contacted: 0,
      quoted: 0,
      won: 0,
      lost: 0,
      spam: 0,
      latestLeadAt: null,
      topSources: [],
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

      const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: weeklyData, error: weeklyError } = await service
        .from("lead_events")
        .select("type,status,source,created_at")
        .gte("created_at", since7d)
        .order("created_at", { ascending: false })
        .limit(5000);

      if (!weeklyError && weeklyData) {
        const sourceMap = new Map<string, number>();
        for (const lead of weeklyData) {
          const source = (lead.source || "(unknown)").trim();
          sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
        }

        weeklyProofSummary = {
          windowDays: 7,
          totalEvents: weeklyData.length,
          quoteForms: weeklyData.filter((lead) => lead.type === "quote_form").length,
          callClicks: weeklyData.filter((lead) => lead.type === "call_click").length,
          emailClicks: weeklyData.filter((lead) => lead.type === "email_click").length,
          newStatus: weeklyData.filter((lead) => lead.status === "new").length,
          contacted: weeklyData.filter((lead) => lead.status === "contacted").length,
          quoted: weeklyData.filter((lead) => lead.status === "quoted").length,
          won: weeklyData.filter((lead) => lead.status === "won").length,
          lost: weeklyData.filter((lead) => lead.status === "lost").length,
          spam: weeklyData.filter((lead) => lead.status === "spam").length,
          latestLeadAt: weeklyData[0]?.created_at || null,
          topSources: Array.from(sourceMap.entries())
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
        };
      }
    }

    return NextResponse.json({
      success: true,
      leads: data ?? [],
      trackedLeads,
      trackedLeadSummary,
      weeklyProofSummary,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentAuthUser();
    if (!user || !(await isAdminUser(user))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const leadId = typeof payload?.leadId === "string" ? payload.leadId.trim() : "";
    const status = typeof payload?.status === "string" ? payload.status.trim().toLowerCase() : "";

    if (!leadId || !status) {
      return NextResponse.json({ error: "leadId and status are required" }, { status: 400 });
    }

    if (!ALLOWED_LEAD_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const service = getServiceClient();

    const { data: existing, error: existingError } = await service
      .from("lead_events")
      .select("id,status,metadata")
      .eq("id", leadId)
      .single();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 404 });
    }

    const metadata =
      existing?.metadata && typeof existing.metadata === "object"
        ? (existing.metadata as Record<string, unknown>)
        : {};

    const history = Array.isArray(metadata.status_history)
      ? metadata.status_history.slice(-19)
      : [];

    history.push({
      from: existing?.status || null,
      to: status,
      changed_at: new Date().toISOString(),
      changed_by: user.email || user.id,
    });

    const nextMetadata = {
      ...metadata,
      status_history: history,
      last_status_changed_by: user.email || user.id,
      last_status_changed_at: new Date().toISOString(),
    };

    const { data, error } = await service
      .from("lead_events")
      .update({ status, metadata: nextMetadata })
      .eq("id", leadId)
      .select(
        "id,type,status,source,referrer,name,phone,email,suburb,service_needed,message,metadata,created_at,updated_at,business_profile:business_profiles(slug,business_name,plan,email,phone)"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
