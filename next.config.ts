import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const clearviewSiteRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Parent folder also has package-lock.json; pin Turbopack to this app.
  turbopack: {
    root: clearviewSiteRoot,
  },
};

export default nextConfig;
