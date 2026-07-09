// 🔑 Keywords: Credentials AI founding attach, welcome flow, owner attach api
// Route handler for the /welcome ClaimAccountForm. Attaches the logged-in
// user as the owner of the given slug's business_profiles row, provided the
// row does not already have a different owner. Idempotent.

import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";
import { attachOwnerIfMissing, getFoundingMemberBySlug } from "@/lib/founding-member";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { slug?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = body.slug?.trim().toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  }

  // Verify the caller is actually authed as the user they claim to be. This
  // avoids someone stuffing a random userId into the request body.
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  if (body.userId && body.userId !== user.id) {
    return NextResponse.json({ error: "user_mismatch" }, { status: 403 });
  }

  const record = await getFoundingMemberBySlug(slug);
  if (!record) {
    return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  }

  if (record.owner_user_id && record.owner_user_id !== user.id) {
    return NextResponse.json({ error: "different_owner" }, { status: 409 });
  }

  const result = await attachOwnerIfMissing(record.id, user.id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason ?? "attach_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, attached: result.wasAttached });
}
