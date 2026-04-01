import { notFound } from "next/navigation";

import { ManagerDashboard } from "@/components/manager/manager-dashboard";

/**
 * When MANAGER_ACCESS_TOKEN is set (e.g. on Vercel), /manager is disabled.
 * Use /internal/<MANAGER_ACCESS_TOKEN> instead — not linked from the marketing site.
 */
export default function LegacyManagerPage() {
  const secret = process.env.MANAGER_ACCESS_TOKEN?.trim();
  if (secret && secret.length >= 16) {
    notFound();
  }

  return <ManagerDashboard />;
}
