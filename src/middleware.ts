import { NextResponse, type NextRequest } from "next/server";

// 🔑 Keywords: Credentials AI middleware, dashboard guard, admin guard, supabase auth cookie
// Guards `/admin/*` and `/dashboard/*`. The finer-grained ownership check
// for `/dashboard/[slug]` (slug ↔ user) happens inside each dashboard page
// via assertOwnership — the middleware only enforces "must be logged in."

const GUARDED_PREFIXES = ["/admin", "/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = GUARDED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) {
    return NextResponse.next();
  }

  const hasSupabaseAuthCookie = request.cookies
    .getAll()
    .some(
      (cookie) =>
        // `.includes` (not `.endsWith`) so chunked Supabase cookies
        // (sb-<ref>-auth-token.0, .1, …) are also recognised.
        cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
    );

  if (hasSupabaseAuthCookie) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/auth/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
