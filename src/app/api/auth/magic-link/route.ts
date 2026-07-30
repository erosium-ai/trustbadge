// 🔑 Keywords: Credentials AI magic link, server token hash, login recovery, PKCE-independent auth
// Generates a server-verified one-time login URL and sends it through the
// Credentials AI email lane. This avoids browser-bound PKCE verifier loss when
// customers open email links in a different Safari tab or mail webview.

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/brand";
import { normalizeEmail } from "@/lib/founding-member";

export const dynamic = "force-dynamic";

const GENERIC_SUCCESS = {
  success: true,
  message: "If that email has an account, a secure dashboard link has been sent.",
};
const SEND_COOLDOWN_MS = 60_000;

type AuthUserMatch = {
  id: string;
  email: string;
  userMetadata: Record<string, unknown>;
};

async function findAuthUserByEmail(email: string): Promise<AuthUserMatch | null> {
  const service = getServiceClient();
  const perPage = 200;
  let page = 1;
  const visited = new Set<number>();

  while (!visited.has(page)) {
    visited.add(page);
    const { data, error } = await service.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`list_users_failed:${error.message}`);

    const match = (data.users ?? []).find(
      (user) => normalizeEmail(user.email ?? null) === email
    );
    if (match?.id) {
      return {
        id: match.id,
        email,
        userMetadata: (match.user_metadata ?? {}) as Record<string, unknown>,
      };
    }

    const nextPage =
      typeof data.nextPage === "number" && Number.isFinite(data.nextPage)
        ? data.nextPage
        : null;
    if ((data.users ?? []).length < perPage || !nextPage || nextPage === page) {
      return null;
    }
    page = nextPage;
  }

  throw new Error("list_users_no_progress");
}

function safeNextPath(value: unknown, origin: string): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /%(?:2f|5c)/i.test(value)
  ) {
    return "/dashboard";
  }

  try {
    const destination = new URL(value, origin);
    if (destination.origin !== origin) return "/dashboard";
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/dashboard";
  }
}

async function sendRecoveryEmail(params: {
  to: string;
  recoveryUrl: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("resend_not_configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "User-Agent": "credentials-ai-auth-recovery/1.0",
    },
    body: JSON.stringify({
      from:
        process.env.CREDENTIALS_AI_AUTH_FROM ||
        "Credentials AI <eros@erosium.com.au>",
      to: [params.to],
      subject: "Your Credentials AI dashboard access",
      text: [
        "Open your secure one-time Credentials AI dashboard link:",
        "",
        params.recoveryUrl,
        "",
        "This link can be used once. If you did not request it, ignore this email.",
      ].join("\n"),
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a"><h2>Your secure dashboard link</h2><p><a href="${params.recoveryUrl.replace(/&/g, "&amp;")}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Open my dashboard</a></p><p style="font-size:13px;color:#64748b">This secure link can be used once. If you did not request it, ignore this email.</p></div>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`resend_failed:${response.status}:${body.slice(0, 160)}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(
      typeof body?.email === "string" ? body.email : null
    );

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const origin = new URL(getSiteUrl()).origin;
    const next = safeNextPath(body?.next, origin);
    const service = getServiceClient();
    const authUser = await findAuthUserByEmail(email);
    if (!authUser) {
      return NextResponse.json(GENERIC_SUCCESS);
    }

    // Durable per-account cooldown prevents the custom delivery lane from
    // becoming an email-spam bypass. Keep the public response generic.
    const lastSentRaw = authUser.userMetadata.credentials_magic_link_sent_at;
    const lastSent =
      typeof lastSentRaw === "string" ? Date.parse(lastSentRaw) : Number.NaN;
    if (Number.isFinite(lastSent) && Date.now() - lastSent < SEND_COOLDOWN_MS) {
      return NextResponse.json(GENERIC_SUCCESS);
    }

    const sentAt = new Date().toISOString();
    const { error: cooldownError } = await service.auth.admin.updateUserById(
      authUser.id,
      {
        user_metadata: {
          ...authUser.userMetadata,
          credentials_magic_link_sent_at: sentAt,
        },
      }
    );
    if (cooldownError) {
      throw new Error(`magic_link_cooldown_failed:${cooldownError.message}`);
    }

    const { data, error } = await service.auth.admin.generateLink({
      type: "magiclink",
      email: authUser.email,
      options: { data: { login_recovery: true } },
    });

    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) {
      throw new Error(`generate_link_failed:${error?.message ?? "missing_token"}`);
    }

    // Email security scanners prefetch GET links. Land on a non-redeeming
    // confirmation page first; the token is exchanged only after the customer
    // presses the POST button on that page.
    const recoveryUrl = new URL("/auth/continue", origin);
    recoveryUrl.searchParams.set("token_hash", tokenHash);
    recoveryUrl.searchParams.set("next", next);

    await sendRecoveryEmail({
      to: email,
      recoveryUrl: recoveryUrl.toString(),
    });

    return NextResponse.json(GENERIC_SUCCESS);
  } catch (error) {
    console.error("magic_link_send_failed", error);
    return NextResponse.json(
      { success: false, error: "Unable to send a secure login link right now." },
      { status: 500 }
    );
  }
}
