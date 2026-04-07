import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const clearviewSiteRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: { root: clearviewSiteRoot },

  async headers() {
    // Content Security Policy:
    // - default-src 'self'          → only load resources from this domain by default
    // - script-src  'self' + unsafe-inline + vercel analytics
    // - style-src   'self' + unsafe-inline  (Tailwind inlines styles at runtime)
    // - img-src     'self' data: blob:      (allows base64 images and local blobs)
    // - font-src    'self' data:
    // - connect-src 'self' + vercel analytics endpoints
    // - frame-ancestors 'none'             → equivalent to X-Frame-Options DENY
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
      "media-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
