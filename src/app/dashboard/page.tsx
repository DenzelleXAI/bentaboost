import { AppShell } from "@/components/Shell";
import { DashboardClient } from "@/components/DashboardClient";
import { fetchDashboardData } from "@/lib/data";

export default async function DashboardPage({ searchParams }: { searchParams: { success?: string } }) {
  const data = await fetchDashboardData();
  return <AppShell><DashboardClient {...data} success={searchParams.success} /></AppShell>;
}
