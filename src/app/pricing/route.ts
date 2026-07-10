// 🔑 Keywords: Credentials AI pricing redirect, checkout cancel landing, welcome incomplete landing
// `/pricing` previously 404'd, but the /welcome flow and the SchemaPage
// checkout cancel_url both send customers here. Redirect to the homepage
// pricing section, preserving the checkout status for potential messaging.

import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  const checkout = url.searchParams.get("checkout");
  url.pathname = "/";
  url.search = checkout ? `?checkout=${encodeURIComponent(checkout)}` : "";
  url.hash = "pricing";
  return NextResponse.redirect(url, 307);
}
