import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSiteUrl } from "@/lib/brand";

function safeNextPath(value: string | null, origin: string): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /%(?:2f|5c)/i.test(value)
  ) {
    return null;
  }

  try {
    const destination = new URL(value, origin);
    if (destination.origin !== origin) return null;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const canonicalOrigin = new URL(getSiteUrl()).origin;
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"), canonicalOrigin);

  // Never derive public redirects from Railway's internal request origin.
  const redirectUrl = new URL("/auth/login", canonicalOrigin);

  if (!code) {
    redirectUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  const destination = next ?? "/dashboard";
  const finalUrl = new URL(destination, canonicalOrigin);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    redirectUrl.searchParams.set("error", "missing_supabase_env");
    return NextResponse.redirect(redirectUrl);
  }

  const redirectResponse = NextResponse.redirect(finalUrl);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Preserve Supabase's cookie options (HttpOnly, SameSite, Secure, etc.)
          // but ensure SameSite=Lax so cookies survive the redirect on mobile
          redirectResponse.cookies.set(name, value, {
            ...options,
            sameSite: "lax",
            secure: true,
          });
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    redirectUrl.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(redirectUrl);
  }

  // Auth cookies are NowOn the redirect response via setAll callback.
  // The redirect to /dashboard will carry these cookies in the browser.
  // /dashboard resolver handles routing to the correct business slug.
  return redirectResponse;
}
