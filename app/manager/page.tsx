import { notFound } from "next/navigation";

import { ManagerDashboard } from "@/components/manager/manager-dashboard";

/**
 * When MANAGER_ACCESS_TOKEN is set (e.g. on Vercel), /manager is disabled.
 * Use /internal/<MANAGER_ACCESS_TOKEN> instead — not linked from the marketing site.
 */
export default function LegacyManagerPage() {
  if (process.env.MANAGER_ACCESS_TOKEN && process.env.MANAGER_ACCESS_TOKEN.length >= 16) {
    notFound();
  }

  return <ManagerDashboard />;
}
