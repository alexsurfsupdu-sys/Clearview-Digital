import { notFound } from "next/navigation";

import { ManagerDashboard } from "@/components/manager/manager-dashboard";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function InternalManagerPage({ params }: PageProps) {
  const { token } = await params;
  const secret = process.env.MANAGER_ACCESS_TOKEN;

  if (!secret || secret.length < 16 || token !== secret) {
    notFound();
  }

  return <ManagerDashboard />;
}
