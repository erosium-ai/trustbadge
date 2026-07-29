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

  // We use a placeholder redirect response so Supabase's setAll has somewhere
  // to write auth cookies. Those cookies will be copied to whichever response
  // we actually return (server redirect for desktop, HTML page for mobile).
  const cookieHolder = NextResponse.redirect(finalUrl);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieHolder.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    redirectUrl.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(redirectUrl);
  }

  // On mobile (in-app email browsers like Gmail's WebView or Apple Mail's
  // SFSafariViewController), redirect-based Set-Cookie is often rejected
  // because of strict third-party cookie policies. Instead of a server-side
  // redirect, we serve a client page with the cookies already set on the
  // response. The client-side script then validates the session is readable
  // and navigates to /dashboard — all same-origin from this point forward,
  // so cookies persist.
  const ua = request.headers.get("user-agent") || "";
  const isMobile = /mobile|iphone|ipad|android/i.test(ua);

  if (isMobile) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Signing in…</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { text-align: center; padding: 2rem; }
  .spinner { width: 2rem; height: 2rem; border: 3px solid #334155; border-top-color: #14b8a6; border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto 1rem; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style></head>
<body>
<div class="card">
  <div class="spinner"></div>
  <p>Signing you in…</p>
</div>
<script type="module">
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
  const supabase = createClient(
    "${supabaseUrl}",
    "${supabaseKey}"
  );
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.replace("/auth/login?error=auth_callback_failed");
      return;
    }
    window.location.replace("/dashboard");
  } catch {
    window.location.replace("/auth/login?error=auth_callback_failed");
  }
</script>
</body>
</html>`;

    const htmlResponse = new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });

    // Copy auth cookies from the placeholder to the HTML response
    cookieHolder.cookies.getAll().forEach((cookie) => {
      htmlResponse.headers.append(
        "Set-Cookie",
        `${cookie.name}=${cookie.value}; Path=/; SameSite=Lax; Secure`
      );
    });

    return htmlResponse;
  }

  // Desktop: standard server-side redirect with cookies
  return cookieHolder;
}
