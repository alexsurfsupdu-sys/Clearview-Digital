/**
 * Cookie value proves the browser opened the secret /internal/<token> URL.
 * Token itself is never stored in the cookie — only a SHA-256 digest.
 */
export const MANAGER_COOKIE_NAME = "cv_mgr_v1";

const encoder = new TextEncoder();

export async function computeManagerProof(secret: string): Promise<string> {
  const data = encoder.encode(`cv-manager-cookie|${secret}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyManagerProof(
  secret: string,
  cookieValue: string | undefined,
): Promise<boolean> {
  if (!cookieValue) return false;
  const expected = await computeManagerProof(secret);
  if (expected.length !== cookieValue.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ cookieValue.charCodeAt(i);
  }
  return diff === 0;
}
