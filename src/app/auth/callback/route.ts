import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function safeNextPath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/auth/login";
  redirectUrl.search = "";

  if (!code) {
    redirectUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  const destination = next ?? "/dashboard";
  const finalUrl = new URL(destination, request.url);

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
