/** Strip HTML tags and dangerous characters from a string. */
export function sanitizeString(value: unknown, maxLength = 500): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>"]/g, ""); // strip remaining dangerous chars
}

/** Validate and return a sanitized email, or empty string if invalid. */
export function sanitizeEmail(value: unknown): string {
  const s = sanitizeString(value, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? s : "";
}

/** Validate and return a sanitized URL (http/https only), or empty string. */
export function sanitizeUrl(value: unknown): string {
  const s = sanitizeString(value, 300);
  if (!s) return "";
  try {
    const url = new URL(s.startsWith("http") ? s : `https://${s}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

/** Strip all HTML for safe embedding in email templates. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
