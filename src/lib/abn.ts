export type AbnVerificationStatus =
  | "verified"
  | "verified_name_mismatch"
  | "inactive"
  | "not_found"
  | "checksum_valid_unverified"
  | "format_invalid"
  | "error";

export type VerificationConfidence = "high" | "medium" | "low";

export interface AbnVerificationResult {
  status: AbnVerificationStatus;
  confidence: VerificationConfidence;
  source: string;
  message: string;
  checkedAt: string;
  inputAbn: string;
  normalizedAbn: string;
  inputBusinessName?: string;
  matchedBusinessName?: string | null;
  abrStatus?: string | null;
}

const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

function normalizeAbn(abn: string): string {
  return (abn || "").replace(/\D/g, "");
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isAbnChecksumValid(abnDigits: string): boolean {
  if (!/^\d{11}$/.test(abnDigits)) return false;

  const digits = abnDigits.split("").map((digit) => Number.parseInt(digit, 10));
  digits[0] -= 1;

  const sum = digits.reduce((acc, digit, index) => acc + digit * ABN_WEIGHTS[index], 0);
  return sum % 89 === 0;
}

function parsePossiblyWrappedJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed) as Record<string, unknown>;
  }

  const wrapped = trimmed.match(/^[^(]+\(([\s\S]*)\);?$/);
  if (wrapped?.[1]) {
    return JSON.parse(wrapped[1]) as Record<string, unknown>;
  }

  return null;
}

function pickString(payload: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export async function verifyAbn(
  inputAbn: string,
  inputBusinessName?: string
): Promise<AbnVerificationResult> {
  const checkedAt = new Date().toISOString();
  const normalizedAbn = normalizeAbn(inputAbn);

  if (!/^\d{11}$/.test(normalizedAbn)) {
    return {
      status: "format_invalid",
      confidence: "low",
      source: "ABN format check",
      message: "ABN must contain exactly 11 digits.",
      checkedAt,
      inputAbn,
      normalizedAbn,
      inputBusinessName,
    };
  }

  if (!isAbnChecksumValid(normalizedAbn)) {
    return {
      status: "format_invalid",
      confidence: "low",
      source: "ABN checksum",
      message: "ABN checksum failed.",
      checkedAt,
      inputAbn,
      normalizedAbn,
      inputBusinessName,
    };
  }

  const abrGuid = process.env.ABR_GUID?.trim();

  if (!abrGuid) {
    return {
      status: "checksum_valid_unverified",
      confidence: "medium",
      source: "ABN checksum (no ABR API key configured)",
      message: "ABN format and checksum are valid, but ABR API verification is not configured.",
      checkedAt,
      inputAbn,
      normalizedAbn,
      inputBusinessName,
    };
  }

  try {
    const endpoint = `https://abr.business.gov.au/json/AbnDetails.aspx?abn=${encodeURIComponent(normalizedAbn)}&guid=${encodeURIComponent(abrGuid)}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "User-Agent": "credentials-ai-trustbadge/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        status: "error",
        confidence: "low",
        source: "Australian Business Register (ABR) API",
        message: `ABR request failed (${response.status}).`,
        checkedAt,
        inputAbn,
        normalizedAbn,
        inputBusinessName,
      };
    }

    const text = await response.text();
    const payload = parsePossiblyWrappedJson(text);

    if (!payload) {
      return {
        status: "error",
        confidence: "low",
        source: "Australian Business Register (ABR) API",
        message: "ABR response could not be parsed.",
        checkedAt,
        inputAbn,
        normalizedAbn,
        inputBusinessName,
      };
    }

    const abrStatus = pickString(payload, ["AbnStatus", "abnStatus", "ABNStatus"]);
    const entityName = pickString(payload, ["EntityName", "entityName", "MainName"]);
    const statusLower = (abrStatus || "").toLowerCase();

    if (!abrStatus || statusLower === "cancelled" || statusLower === "not found") {
      return {
        status: "not_found",
        confidence: "low",
        source: "Australian Business Register (ABR) API",
        message: "ABN was not found in the ABR response.",
        checkedAt,
        inputAbn,
        normalizedAbn,
        inputBusinessName,
        abrStatus,
      };
    }

    if (statusLower !== "active") {
      return {
        status: "inactive",
        confidence: "low",
        source: "Australian Business Register (ABR) API",
        message: `ABN is not active (status: ${abrStatus}).`,
        checkedAt,
        inputAbn,
        normalizedAbn,
        inputBusinessName,
        matchedBusinessName: entityName,
        abrStatus,
      };
    }

    const hasBusinessName = Boolean(inputBusinessName?.trim());
    const nameMatches = hasBusinessName
      ? normalizeName(inputBusinessName || "").includes(normalizeName(entityName || "")) ||
        normalizeName(entityName || "").includes(normalizeName(inputBusinessName || ""))
      : true;

    if (!nameMatches) {
      return {
        status: "verified_name_mismatch",
        confidence: "medium",
        source: "Australian Business Register (ABR) API",
        message: "ABN is active, but business name does not closely match ABR entity name.",
        checkedAt,
        inputAbn,
        normalizedAbn,
        inputBusinessName,
        matchedBusinessName: entityName,
        abrStatus,
      };
    }

    return {
      status: "verified",
      confidence: "high",
      source: "Australian Business Register (ABR) API",
      message: "ABN verified against ABR as active.",
      checkedAt,
      inputAbn,
      normalizedAbn,
      inputBusinessName,
      matchedBusinessName: entityName,
      abrStatus,
    };
  } catch (error) {
    return {
      status: "error",
      confidence: "low",
      source: "Australian Business Register (ABR) API",
      message: (error as Error).message || "ABN verification failed.",
      checkedAt,
      inputAbn,
      normalizedAbn,
      inputBusinessName,
    };
  }
}
