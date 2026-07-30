// 🔑 Keywords: Credentials AI auth confirm, checkout magic link, token hash verification, mobile login
// Verifies the server-generated checkout magic-link token and writes Supabase
// session cookies onto the branded Credentials AI redirect response.

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSiteUrl } from "@/lib/brand";

function safeNextPath(value: string | null, origin: string): string {
  if (
    !value ||
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

async function confirmMagicLink(
  request: NextRequest,
  tokenHash: string | null,
  requestedNext: string | null
) {
  const canonicalOrigin = new URL(getSiteUrl()).origin;
  const next = safeNextPath(requestedNext, canonicalOrigin);

  // Railway terminates TLS at the proxy and can present request.url as
  // http://localhost:8080 internally. Every customer-facing redirect must be
  // built from the configured public origin instead.
  const loginUrl = new URL("/auth/login", canonicalOrigin);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!tokenHash) {
    loginUrl.searchParams.set("error", "missing_token");
    return NextResponse.redirect(loginUrl);
  }

  if (!supabaseUrl || !supabaseKey) {
    loginUrl.searchParams.set("error", "missing_supabase_env");
    return NextResponse.redirect(loginUrl);
  }

  const destination = new URL(next, canonicalOrigin);
  const redirectResponse = NextResponse.redirect(destination, 303);
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, {
            ...options,
            sameSite: "lax",
            secure: true,
          });
        });
      },
    },
  });

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });

  if (error || !data.user) {
    loginUrl.searchParams.set("error", "auth_confirm_failed");
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl, 303);
  }

  return redirectResponse;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  return confirmMagicLink(
    request,
    requestUrl.searchParams.get("token_hash"),
    requestUrl.searchParams.get("next")
  );
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const tokenHash = formData?.get("token_hash");
  const next = formData?.get("next");

  return confirmMagicLink(
    request,
    typeof tokenHash === "string" ? tokenHash : null,
    typeof next === "string" ? next : null
  );
}
