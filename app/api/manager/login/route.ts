import { NextResponse } from "next/server";

import { computeManagerProof, MANAGER_COOKIE_NAME } from "@/lib/manager/manager-proof";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  // Rate limit: 10 attempts per 15 minutes per IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimit(`login:${ip}`, 10, 900);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait 15 minutes and try again." },
      { status: 429 },
    );
  }

  const secret = process.env.MANAGER_ACCESS_TOKEN?.trim();
  const expectedUsername = process.env.MANAGER_USERNAME?.trim();
  const expectedPassword = process.env.MANAGER_PASSWORD?.trim();

  if (!secret || secret.length < 16) {
    return NextResponse.json(
      { error: "Manager not configured. Set MANAGER_ACCESS_TOKEN in Vercel (16+ chars)." },
      { status: 503 },
    );
  }
  if (!expectedUsername || !expectedPassword) {
    return NextResponse.json(
      {
        error:
          "Login credentials not configured. Add MANAGER_USERNAME and MANAGER_PASSWORD in Vercel environment variables.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const username = sanitizeString(b.username, 100);
  const password = typeof b.password === "string" ? b.password.slice(0, 200) : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  // Constant-time comparison to prevent timing attacks
  function constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }

  const usernameOk = constantTimeEqual(username, expectedUsername);
  const passwordOk = constantTimeEqual(password, expectedPassword);

  if (!usernameOk || !passwordOk) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  // Issue the manager session cookie
  const proof = await computeManagerProof(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MANAGER_COOKIE_NAME, proof, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 days
  });
  return res;
}

/** Logout: clear the session cookie. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MANAGER_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
