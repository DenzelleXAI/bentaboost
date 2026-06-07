import { notFound } from "next/navigation";
import { AppShell } from "@/components/Shell";
import { PostForm } from "@/components/PostForm";
import { fetchFolders, fetchPostById } from "@/lib/data";

export default async function EditPage({ params }: { params: { id: string } }) {
  const [post, folders] = await Promise.all([fetchPostById(params.id), fetchFolders()]);
  if (!post) notFound();
  return <AppShell><PostForm folders={folders} initialPost={post} /></AppShell>;
}
