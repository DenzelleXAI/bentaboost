import { AppShell } from "@/components/Shell";
import { PostForm } from "@/components/PostForm";
import { fetchFolders } from "@/lib/data";

export default async function CreatePage() {
  const folders = await fetchFolders();
  return <AppShell><PostForm folders={folders} /></AppShell>;
}
