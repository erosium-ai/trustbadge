import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export function isHealthCheckAuthorized(request: NextRequest): boolean {
  const configured = process.env.CREDENTIALS_AI_HEALTHCHECK_TOKEN?.trim();
  const header = request.headers.get("authorization") || "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!configured || !supplied) return false;

  const expected = Buffer.from(configured);
  const actual = Buffer.from(supplied);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
