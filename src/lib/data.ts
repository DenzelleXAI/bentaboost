import { getSupabaseServerClient, isServiceSupabaseConfigured } from "./supabase";
import type { ClickEvent, Folder, Post, PostWithClicks } from "./types";

export function emptyData() {
  return { posts: [] as PostWithClicks[], folders: [] as Folder[], clicks: [] as ClickEvent[] };
}

export async function fetchDashboardData() {
  if (!isServiceSupabaseConfigured()) return emptyData();
  const supabase = getSupabaseServerClient();
  const [postsResult, foldersResult, clicksResult] = await Promise.all([
    supabase.from("posts").select("*, folders(id,name)").order("created_at", { ascending: false }),
    supabase.from("folders").select("*").order("name", { ascending: true }),
    supabase.from("click_events").select("*").order("clicked_at", { ascending: false })
  ]);

  if (postsResult.error || foldersResult.error || clicksResult.error) return emptyData();
  const clicks = (clicksResult.data || []) as ClickEvent[];
  const posts = ((postsResult.data || []) as Post[]).map((post) => withClickCounts(post, clicks));
  return { posts, folders: (foldersResult.data || []) as Folder[], clicks };
}

export async function fetchPostBySlug(slug: string) {
  if (!isServiceSupabaseConfigured()) return null;
  const { data } = await getSupabaseServerClient().from("posts").select("*").eq("slug", slug).single();
  return data as Post | null;
}

export async function fetchPostById(id: string) {
  if (!isServiceSupabaseConfigured()) return null;
  const { data } = await getSupabaseServerClient().from("posts").select("*").eq("id", id).single();
  return data as Post | null;
}

export async function fetchFolders() {
  if (!isServiceSupabaseConfigured()) return [] as Folder[];
  const { data } = await getSupabaseServerClient().from("folders").select("*").order("name");
  return (data || []) as Folder[];
}

export function countClicks(clicks: ClickEvent[], postId?: string | null, since?: Date) {
  return clicks.filter((click) => (!postId || click.post_id === postId) && (!since || new Date(click.clicked_at) >= since)).length;
}

export function withClickCounts(post: Post, clicks: ClickEvent[]): PostWithClicks {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const seven = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirty = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return {
    ...post,
    clicks_today: countClicks(clicks, post.id, today),
    clicks_7d: countClicks(clicks, post.id, seven),
    clicks_30d: countClicks(clicks, post.id, thirty),
    clicks_all: countClicks(clicks, post.id)
  };
}
