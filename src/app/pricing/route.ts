// 🔑 Keywords: Credentials AI pricing redirect, checkout cancel landing, welcome incomplete landing
// `/pricing` previously 404'd, but the /welcome flow and the SchemaPage
// checkout cancel_url both send customers here. Redirect to the homepage
// pricing section, preserving the checkout status for potential messaging.

import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  // Behind Railway's proxy req.nextUrl.origin resolves to the internal host
  // (localhost:8080), so build the redirect from the canonical site URL.
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://credentialsai.com.au";
  const checkout = req.nextUrl.searchParams.get("checkout");
  const target = new URL("/", base);
  if (checkout) target.searchParams.set("checkout", checkout);
  target.hash = "pricing";
  return NextResponse.redirect(target, 307);
}
