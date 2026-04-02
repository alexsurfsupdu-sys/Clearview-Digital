import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  computeManagerProof,
  MANAGER_COOKIE_NAME,
  verifyManagerProof,
} from "@/lib/manager/manager-proof";

function isManagerProtectionEnabled(secret: string | undefined): secret is string {
  return Boolean(secret && secret.length >= 16);
}

export async function proxy(request: NextRequest) {
  const secret = process.env.MANAGER_ACCESS_TOKEN?.trim();
  const path = request.nextUrl.pathname;

  if (!isManagerProtectionEnabled(secret)) {
    return NextResponse.next();
  }

  const isApi = path === "/api/manager" || path.startsWith("/api/manager/");
  const isLegacyManager = path === "/manager" || path.startsWith("/manager/");
  const isInternal = path === "/internal" || path.startsWith("/internal/");

  if (isInternal) {
    if (path === "/internal" || path === "/internal/") {
      return NextResponse.next();
    }
    const raw = path.slice("/internal/".length).split("/")[0] ?? "";
    const urlToken = decodeURIComponent(raw).trim();
    if (urlToken !== secret) {
      return new NextResponse(null, { status: 404 });
    }
    const proof = await computeManagerProof(secret);
    const res = NextResponse.next();
    res.cookies.set(MANAGER_COOKIE_NAME, proof, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });
    return res;
  }

  if (isLegacyManager) {
    // /manager/login — always public
    if (path === "/manager/login" || path.startsWith("/manager/login/")) {
      return NextResponse.next();
    }
    // /manager/dashboard — cookie-protected; redirect to login if missing
    if (path === "/manager/dashboard" || path.startsWith("/manager/dashboard/")) {
      const cookie = request.cookies.get(MANAGER_COOKIE_NAME)?.value;
      const ok = await verifyManagerProof(secret, cookie);
      if (!ok) {
        return NextResponse.redirect(new URL("/manager/login", request.url));
      }
      return NextResponse.next();
    }
    // /manager root → redirect to dashboard or login depending on cookie
    const cookie = request.cookies.get(MANAGER_COOKIE_NAME)?.value;
    const ok = await verifyManagerProof(secret, cookie);
    return NextResponse.redirect(
      new URL(ok ? "/manager/dashboard" : "/manager/login", request.url),
    );
  }

  if (isApi) {
    // Login route is public (it sets the cookie)
    if (path === "/api/manager/login" || path.startsWith("/api/manager/login/")) {
      return NextResponse.next();
    }
    if (path === "/api/manager/agent" || path.startsWith("/api/manager/agent/")) {
      return NextResponse.next();
    }
    const cookie = request.cookies.get(MANAGER_COOKIE_NAME)?.value;
    const ok = await verifyManagerProof(secret, cookie);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/manager",
    "/manager/:path*",
    "/internal",
    "/internal/:path*",
    "/api/manager",
    "/api/manager/:path*",
  ],
};
