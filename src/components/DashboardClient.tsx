"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { SITE_URL } from "@/lib/config";
import type { ClickEvent, Folder, PostWithClicks } from "@/lib/types";
import { isLocalhostUrl, isShortShopeeShare, validateFacebookPostUrl } from "@/lib/validation";
import { ConfirmModal } from "./ConfirmModal";

type Props = { posts: PostWithClicks[]; folders: Folder[]; clicks: ClickEvent[]; success?: string };

type Sort = "newest" | "today" | "week" | "month" | "all" | "folder";

export function DashboardClient({ posts, folders, clicks, success }: Props) {
  const [folderFilter, setFolderFilter] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [deletePost, setDeletePost] = useState<PostWithClicks | null>(null);
  const [message, setMessage] = useState(success || "");
  const [relayInputs, setRelayInputs] = useState<Record<string, string>>(Object.fromEntries(posts.map((p) => [p.id, p.facebook_post_url || ""])));
  const [relayErrors, setRelayErrors] = useState<Record<string, string>>({});
  const filtered = useMemo(() => {
    const list = posts.filter((p) => folderFilter === "all" || (folderFilter === "unfoldered" ? !p.folder_id : p.folder_id === folderFilter));
    return [...list].sort((a, b) => {
      if (sort === "today") return b.clicks_today - a.clicks_today;
      if (sort === "week") return b.clicks_7d - a.clicks_7d;
      if (sort === "month") return b.clicks_30d - a.clicks_30d;
      if (sort === "all") return b.clicks_all - a.clicks_all;
      if (sort === "folder") return (a.folders?.name || "Unfoldered").localeCompare(b.folders?.name || "Unfoldered");
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [posts, folderFilter, sort]);
  const best = (key: keyof PostWithClicks) => posts.reduce<PostWithClicks | null>((winner, post) => !winner || Number(post[key]) > Number(winner[key]) ? post : winner, null);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7 = new Date(now.getTime() - 7 * 86400000);
  const last30 = new Date(now.getTime() - 30 * 86400000);
  const metric = (label: string, value: string | number) => <div className="rounded-3xl bg-white p-5 shadow-card"><p className="text-sm font-bold text-gray-500">{label}</p><p className="mt-2 text-3xl font-black text-graphite">{value}</p></div>;
  const clickCount = (since?: Date) => clicks.filter((c) => !since || new Date(c.clicked_at) >= since).length;

  async function copy(value: string) { await navigator.clipboard.writeText(value); setMessage("Copied to clipboard."); }
  function share(url: string) { if (isLocalhostUrl(url)) return alert("Facebook cannot share localhost links. Deploy to Vercel and use the live URL."); window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer"); }
  async function saveRelay(postId: string) {
    const value = relayInputs[postId] || "";
    if (!validateFacebookPostUrl(value)) return setRelayErrors((e) => ({ ...e, [postId]: "Please paste a valid Facebook post/share URL." }));
    const res = await fetch(`/api/posts/${postId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ facebook_post_url: value }) });
    if (!res.ok) return setRelayErrors((e) => ({ ...e, [postId]: "Please paste a valid Facebook post/share URL." }));
    setRelayErrors((e) => ({ ...e, [postId]: "" })); setMessage("Facebook Post URL saved.");
  }
  async function confirmDelete() {
    if (!deletePost) return;
    await fetch(`/api/posts/${deletePost.id}`, { method: "DELETE" });
    setDeletePost(null); setMessage("Preview card deleted."); window.location.href = "/dashboard?success=Preview%20card%20deleted";
  }

  return <div className="space-y-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-bold text-orange-600">BentaBoost</p><h1 className="text-4xl font-black text-graphite">Dashboard</h1><p className="mt-2 text-gray-500">Track preview cards, folders, relay posts, and clicks.</p></div><Link href="/create" className="rounded-full brand-gradient px-6 py-3 text-center font-black text-white shadow-card">Create Link</Link></div>
    {message && <p className="rounded-2xl bg-green-50 p-3 font-bold text-green-700">{message}</p>}
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{metric("Clicks Today", clickCount(today))}{metric("Clicks This Week", clickCount(last7))}{metric("Clicks This Month", clickCount(last30))}{metric("All-Time Clicks", clickCount())}{metric("Total Cards", posts.length)}</section>
    <section className="grid gap-4 lg:grid-cols-4">{metric("Best Card Today", best("clicks_today")?.card_headline || "—")}{metric("Best Card This Week", best("clicks_7d")?.card_headline || "—")}{metric("Best Card This Month", best("clicks_30d")?.card_headline || "—")}{metric("Best Folder This Month", folders.map((f) => ({ name: f.name, clicks: posts.filter((p) => p.folder_id === f.id).reduce((sum, p) => sum + p.clicks_30d, 0) })).sort((a,b)=>b.clicks-a.clicks)[0]?.name || "—")}</section>
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-card sm:flex-row"><select value={folderFilter} onChange={(e) => setFolderFilter(e.target.value)} className="rounded-2xl border px-4 py-3"><option value="all">All folders</option><option value="unfoldered">Unfoldered</option>{folders.map((f)=><option key={f.id} value={f.id}>{f.name}</option>)}</select><select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-2xl border px-4 py-3"><option value="newest">Newest</option><option value="today">Most clicks today</option><option value="week">Most clicks this week</option><option value="month">Most clicks this month</option><option value="all">Most clicks all time</option><option value="folder">Folder name</option></select></div>
    <section className="grid gap-5">{filtered.length === 0 && <div className="rounded-3xl bg-white p-8 text-center shadow-card"><h2 className="text-xl font-black">No preview cards yet</h2><p className="mt-2 text-gray-500">Create your first preview card to start tracking.</p></div>}{filtered.map((post) => { const preview = `${SITE_URL}/p/${post.slug}`; return <article key={post.id} className="grid gap-4 rounded-3xl bg-white p-5 shadow-card lg:grid-cols-[140px_1fr]">
      <img src={post.image_url} alt="" className="aspect-square w-full rounded-2xl bg-orange-50 object-contain p-2" /><div><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-sm font-bold text-orange-600">{post.folders?.name || "Unfoldered"}</p><h2 className="text-2xl font-black text-graphite">{post.card_headline}</h2><p className="text-sm text-gray-500">Relay status: {post.relay_status === "ready" ? "Auto Relay Ready" : post.relay_status === "failed" ? "Auto Relay Failed" : post.relay_status === "posted" ? "Posted" : "Manual"}</p>{post.relay_error && <p className="text-sm font-bold text-red-600">{post.relay_error}</p>}</div><div className="flex gap-2"><Link href={`/edit/${post.id}`} className="rounded-full border px-4 py-2 font-bold">Edit</Link><button onClick={() => setDeletePost(post)} className="rounded-full bg-red-50 px-4 py-2 font-bold text-red-700"><Trash2 size={16}/></button></div></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-4"><span>Today: <b>{post.clicks_today}</b></span><span>7-day: <b>{post.clicks_7d}</b></span><span>30-day: <b>{post.clicks_30d}</b></span><span>All-time: <b>{post.clicks_all}</b></span></div>
      <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => copy(preview)} className="rounded-full bg-orange-50 px-4 py-2 font-bold text-orange-700"><Copy size={15} className="inline"/> Copy Preview URL</button><a href={preview} target="_blank" className="rounded-full bg-gray-100 px-4 py-2 font-bold"><ExternalLink size={15} className="inline"/> Open Preview</a><button onClick={() => share(preview)} className="rounded-full brand-gradient px-4 py-2 font-bold text-white">Share Custom Preview</button>{isShortShopeeShare(post.destination_url) && <button onClick={() => share(post.destination_url)} className="rounded-full bg-green-50 px-4 py-2 font-bold text-green-700">Share Shopee Direct</button>}</div>{isShortShopeeShare(post.destination_url) && <p className="mt-2 text-xs text-gray-500">Direct Shopee share may open the Shopee app better, but Facebook will use Shopee’s preview instead of your custom preview.</p>}
      <div className="mt-4 rounded-2xl bg-orange-50 p-3"><label className="text-sm font-bold">Facebook Post URL</label><p className="text-xs text-gray-500">After manually posting the BentaBoost preview URL to Facebook, paste the Facebook post/share URL here.</p><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input value={relayInputs[post.id] || ""} onChange={(e)=>setRelayInputs((v)=>({...v,[post.id]:e.target.value}))} className="min-w-0 flex-1 rounded-xl border px-3 py-2" placeholder="https://www.facebook.com/..."/><button onClick={()=>saveRelay(post.id)} className="rounded-full bg-white px-4 py-2 font-bold">Save Facebook Post URL</button><button onClick={()=>copy(relayInputs[post.id] || "")} className="rounded-full bg-white px-4 py-2 font-bold">Copy Facebook Post URL</button>{relayInputs[post.id] && <a target="_blank" href={relayInputs[post.id]} className="rounded-full bg-white px-4 py-2 font-bold">Open Facebook Post</a>}</div>{relayErrors[post.id] && <p className="mt-2 text-sm font-bold text-red-600">{relayErrors[post.id]}</p>}</div>
    </div></article>;})}</section>
    <ConfirmModal open={Boolean(deletePost)} title="Delete this preview card?" onCancel={()=>setDeletePost(null)} onConfirm={confirmDelete}><p className="font-bold">{deletePost?.card_headline}</p><p className="mt-3">This will permanently delete:</p><ul className="mt-2 list-disc pl-5"><li>the preview card</li><li>its saved Facebook relay URL</li><li>its click analytics</li></ul><p className="mt-3">This will not delete your product folder.</p></ConfirmModal>
  </div>;
}
