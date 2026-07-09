// 🔑 Keywords: date format, timezone, Australian date, Brisbane AEST, dd/mm/yyyy, leads timestamps
// Shared date/time formatting for the Credentials AI Founder Dashboard.
// Australia standard: DD/MM/YYYY dates, 24-hour times, AEST (Australia/Brisbane).
// Brisbane never observes daylight savings, so this stays consistent year-round
// for Queensland customers. Founding-Member customers are all AU-based.

const AU_TIMEZONE = "Australia/Brisbane";
const AU_LOCALE = "en-AU";

/**
 * Format a date+time as "DD/MM/YYYY, HH:mm" in Brisbane time.
 * Example: "09/07/2026, 17:33"
 * Accepts ISO strings, Date objects, or null (returns "—").
 */
export function formatAuDateTime(input: string | Date | null | undefined): string {
  if (!input) return "\u2014";
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return "\u2014";
    return d.toLocaleString(AU_LOCALE, {
      timeZone: AU_TIMEZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "\u2014";
  }
}

/**
 * Format a date as "DD/MM/YYYY" in Brisbane time.
 * Example: "09/07/2026"
 */
export function formatAuDate(input: string | Date | null | undefined): string {
  if (!input) return "\u2014";
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return "\u2014";
    return d.toLocaleDateString(AU_LOCALE, {
      timeZone: AU_TIMEZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "\u2014";
  }
}

/**
 * Format a time-of-day as "HH:mm" in Brisbane time.
 * Example: "17:33"
 */
export function formatAuTime(input: string | Date | null | undefined): string {
  if (!input) return "\u2014";
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return "\u2014";
    return d.toLocaleTimeString(AU_LOCALE, {
      timeZone: AU_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "\u2014";
  }
}
