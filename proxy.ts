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
  const secret = process.env.MANAGER_ACCESS_TOKEN;
  const path = request.nextUrl.pathname;

  if (!isManagerProtectionEnabled(secret)) {
    return NextResponse.next();
  }

  const isApi = path === "/api/manager" || path.startsWith("/api/manager/");
  const isLegacyManager = path === "/manager" || path.startsWith("/manager/");
  const isInternal = path === "/internal" || path.startsWith("/internal/");

  if (isInternal) {
    if (path === "/internal" || path === "/internal/") {
      return new NextResponse(null, { status: 404 });
    }
    const urlToken = path.slice("/internal/".length).split("/")[0] ?? "";
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
    return new NextResponse(null, { status: 404 });
  }

  if (isApi) {
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
