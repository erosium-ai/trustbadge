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

  const response = NextResponse.redirect(new URL(next ?? "/auth/register", request.url));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    redirectUrl.searchParams.set("error", "missing_supabase_env");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    redirectUrl.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(redirectUrl);
  }

  if (next) {
    return response;
  }

  const { data: badge } = await supabase
    .from("trustbadges")
    .select("slug")
    .eq("user_id", data.user.id)
    .maybeSingle<{ slug: string }>();

  const destination = new URL(badge?.slug ? `/dashboard/${badge.slug}` : "/auth/register", request.url);
  const dashboardResponse = NextResponse.redirect(destination);

  response.cookies.getAll().forEach((cookie) => {
    dashboardResponse.cookies.set(cookie);
  });

  return dashboardResponse;
}
