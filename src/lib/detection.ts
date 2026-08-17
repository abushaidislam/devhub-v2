export const DETECTION_INPUT_LIMIT = 100_000;

export type Detection = {
  slug: string;
  confidence: number;
  reason: string;
};

function decodeBase64Text(value: string) {
  const compact = value.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!compact || compact.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) {
    return null;
  }
  const padded = compact + "=".repeat((4 - (compact.length % 4)) % 4);
  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function isJsonObject(value: string) {
  try {
    const parsed = JSON.parse(value);
    return parsed !== null && typeof parsed === "object";
  } catch {
    return false;
  }
}

// Performance Optimization:
// Fast guard: JWTs never contain whitespace, are under 10KB, and must contain 2 dots.
function isJwt(value: string) {
  if (value.length > 10_000 || /\s/.test(value)) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !/^[A-Za-z0-9_-]*$/.test(parts[2])) {
    return false;
  }
  const header = decodeBase64Text(parts[0]);
  const payload = decodeBase64Text(parts[1]);
  return Boolean(header && payload && isJsonObject(header) && isJsonObject(payload));
}

// Performance Optimization:
// Fast guard: WHATWG URL parsing on large non-URL strings takes ~15ms per run.
// Guarding against length > 8KB, non-http(s) prefix, or whitespace short-circuits in O(1) time.
function isUrl(value: string) {
  if (value.length > 8_192 || !/^https?:\/\//i.test(value) || /\s/.test(value)) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isSql(value: string) {
  return (
    /^(select|insert\s+into|update|delete\s+from|create\s+(table|view)|alter\s+table|with)\b/i.test(
      value,
    ) && /\b(from|into|set|table|select|where|values)\b/i.test(value)
  );
}

// Performance Optimization:
// Fast guard: Cron expressions are single-line 5-field strings under 100 chars.
// Bypasses value.split(/\s+/) array allocation on large inputs.
function isCron(value: string) {
  if (value.length > 100 || value.includes("\n")) return false;
  const fields = value.split(/\s+/);
  return fields.length === 5 && fields.every((field) => /^[\d*/?,\-]+$/.test(field));
}

// Performance Optimization:
// Fast guards for Markdown regex checks:
// Using String.prototype.includes() before executing regexes on inputs up to 100k chars
// avoids expensive multiline regex searches on plain text and non-markdown inputs.
function markdownSignals(value: string) {
  let count = 0;
  if (value.includes("#") && /^#{1,6}\s/m.test(value)) count++;
  if (
    (value.includes("-") || value.includes("*") || value.includes("+")) &&
    /^\s*[-*+]\s+/m.test(value)
  )
    count++;
  if (value.includes("```") && /^```/m.test(value)) count++;
  if (
    value.includes("[") &&
    value.includes("]") &&
    value.includes("(") &&
    value.includes(")") &&
    /\[[^\]]+\]\([^)]+\)/.test(value)
  )
    count++;
  if (value.includes("**") && /\*\*[^*]+\*\*/.test(value)) count++;
  if (value.includes(">") && /^>\s+/m.test(value)) count++;
  return count;
}

function looksPrintable(value: string) {
  if (value.length < 3) return false;
  let printable = 0;
  for (const char of value) {
    if (char === "\n" || char === "\r" || char === "\t" || char >= " ") printable += 1;
  }
  return printable / value.length > 0.9;
}

export function detectInput(input: string): Detection[] {
  if (input.length > DETECTION_INPUT_LIMIT) {
    throw new Error(
      `Detection input must be ${DETECTION_INPUT_LIMIT.toLocaleString("en-US")} characters or fewer.`,
    );
  }
  const value = input.trim();
  if (!value) return [];

  const detections: Detection[] = [];
  const add = (slug: string, confidence: number, reason: string) => {
    if (!detections.some((item) => item.slug === slug)) {
      detections.push({ slug, confidence, reason });
    }
  };

  if ((value.startsWith("{") || value.startsWith("[")) && isJsonObject(value)) {
    add("json-formatter", 1, "Valid JSON object or array");
  }
  if (isJwt(value)) {
    add("jwt-decoder", 0.99, "Valid Base64URL JSON header and payload");
  }
  if (value.length === 7 && /^#[0-9a-f]{6}$/i.test(value)) {
    add("color-converter", 0.98, "Six-digit HEX color");
  }
  if (isUrl(value)) {
    add("url-encoder", 0.96, "Absolute HTTP or HTTPS URL");
  } else if (value.includes("%") && /%[0-9a-f]{2}/i.test(value)) {
    try {
      if (decodeURIComponent(value) !== value) {
        add("url-encoder", 0.78, "Percent-encoded URL component");
      }
    } catch {}
  }
  if (isSql(value)) {
    add("sql-formatter", 0.94, "Recognized SQL statement and clause keywords");
  }
  if (isCron(value)) {
    add("cron-parser", 0.9, "Valid five-field cron shape");
  }

  const signals = markdownSignals(value);
  const hasHeading = value.includes("#") && /^#{1,6}\s/m.test(value);
  const hasCodeFence = value.includes("```") && /^```/m.test(value);
  if (signals >= 2 || hasHeading || hasCodeFence) {
    add("markdown-preview", signals >= 2 ? 0.86 : 0.72, "Recognized Markdown structure");
  }

  if (value.length >= 8 && !value.includes(".") && /^[A-Za-z0-9+/_-]+={0,2}$/.test(value)) {
    const decoded = decodeBase64Text(value);
    if (decoded && looksPrintable(decoded)) {
      add("base64", 0.82, "Decodes to readable UTF-8 text");
    }
  }

  return detections.sort(
    (a, b) => b.confidence - a.confidence || a.slug.localeCompare(b.slug),
  );
}
