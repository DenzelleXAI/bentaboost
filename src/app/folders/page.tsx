import { AppShell } from "@/components/Shell";
import { FoldersClient } from "@/components/FoldersClient";
import { fetchDashboardData } from "@/lib/data";

export default async function FoldersPage() {
  const { folders, posts } = await fetchDashboardData();
  return <AppShell><FoldersClient folders={folders} posts={posts} /></AppShell>;
}
