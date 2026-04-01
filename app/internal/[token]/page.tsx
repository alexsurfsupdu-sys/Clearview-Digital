import { notFound } from "next/navigation";

import { ManagerDashboard } from "@/components/manager/manager-dashboard";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function InternalManagerPage({ params }: PageProps) {
  const { token } = await params;
  const secret = process.env.MANAGER_ACCESS_TOKEN?.trim();
  const protectionOn = Boolean(secret && secret.length >= 16);

  // When MANAGER_ACCESS_TOKEN is unset (typical local dev), any /internal/... path loads the
  // manager so you’re not forced to match production. With protection on, token must match.
  if (protectionOn && token.trim() !== secret) {
    notFound();
  }

  return <ManagerDashboard />;
}
