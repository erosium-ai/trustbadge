// 🔑 Keywords: dashboard profile color update, brand color picker, business_profiles metadata update

import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";
import { getServiceClient } from "@/lib/supabase";
import { assertOwnership } from "@/lib/dashboard-queries";

export const dynamic = "force-dynamic";

const SAFE_COLORS = [
  "#10b981", // emerald
  "#f97316", // sunset orange
  "#facc15", // yellow
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#22c55e", // green
] as const;

const SAFE_COLOR_SET = new Set<string>(SAFE_COLORS.map((color) => color.toLowerCase()));

function normalizeColor(input: string | null | undefined): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(value)) return null;
  if (!SAFE_COLOR_SET.has(value)) return null;
  return value;
}

export async function POST(request: NextRequest) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  let body: { slug?: string; brandColor?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const slug = (body.slug || "").trim().toLowerCase();
  const brandColor = normalizeColor(body.brandColor);

  if (!slug || !brandColor) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }

  const ownership = await assertOwnership(slug, user.id);
  if (!ownership.ok || !ownership.record) {
    return NextResponse.json({ ok: false, error: "not_owner" }, { status: 403 });
  }

  const existingMeta =
    ownership.record.metadata && typeof ownership.record.metadata === "object"
      ? (ownership.record.metadata as Record<string, unknown>)
      : {};

  const nextMetadata = {
    ...existingMeta,
    brand_color: brandColor,
    brand_color_updated_at: new Date().toISOString(),
  };

  const service = getServiceClient();
  const { error } = await service
    .from("business_profiles")
    .update({ metadata: nextMetadata })
    .eq("id", ownership.record.id);

  if (error) {
    console.error("[dashboard/theme] update failed", {
      slug,
      message: error.message,
    });
    return NextResponse.json(
      { ok: false, error: "save_failed", message: "Could not save your color right now." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    slug,
    brandColor,
    allowedColors: SAFE_COLORS,
  });
}
