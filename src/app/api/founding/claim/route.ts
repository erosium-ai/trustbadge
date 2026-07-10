// 🔑 Keywords: Credentials AI founding claim, welcome account create, email confirm bypass, admin createUser
// Server-side account-claim endpoint for the /welcome flow.
//
// Why this exists: Supabase project has email confirmation enabled, so a
// browser `auth.signUp()` returns a user but NO session — the subsequent
// /api/founding/attach call then 401s ("Could not attach your business",
// the bug that required manually rescuing Founding Member #1).
//
// Fix: create the user server-side via the admin API with
// `email_confirm: true`, attach ownership in the same request, then let the
// client sign in with the password normally.
//
// Abuse guard: claiming requires the target business_profiles row to be
// ownerless, and when a payment_email is on file the submitted email must
// match it (case-insensitive).

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import {
  attachOwnerIfMissing,
  getFoundingMemberBySlug,
} from "@/lib/founding-member";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { slug?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = body.slug?.trim().toLowerCase();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!slug) {
    return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "password_too_short" }, { status: 400 });
  }

  const record = await getFoundingMemberBySlug(slug);
  if (!record) {
    return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  }
  if (record.owner_user_id) {
    // Already owned — the client should use the "sign in instead" path.
    return NextResponse.json({ error: "already_owned" }, { status: 409 });
  }
  if (
    record.payment_email &&
    record.payment_email.trim().toLowerCase() !== email
  ) {
    return NextResponse.json({ error: "email_mismatch" }, { status: 403 });
  }

  const client = getServiceClient();

  const { data: created, error: createErr } =
    await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createErr || !created?.user) {
    const message = createErr?.message?.toLowerCase() ?? "";
    if (
      message.includes("already been registered") ||
      message.includes("already registered") ||
      message.includes("already exists")
    ) {
      // Existing account — tell the client to sign in with password instead.
      return NextResponse.json({ error: "email_exists" }, { status: 409 });
    }
    return NextResponse.json(
      { error: createErr?.message ?? "create_failed" },
      { status: 500 }
    );
  }

  const attach = await attachOwnerIfMissing(record.id, created.user.id);
  if (!attach.ok) {
    return NextResponse.json(
      { error: attach.reason ?? "attach_failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
