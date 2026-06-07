"use client";

import { useState } from "react";
import type { FacebookPage } from "@/lib/types";

type Props = { configured: boolean; connection: { facebook_user_name?: string | null } | null; pages: FacebookPage[] };

export function SettingsClient({ configured, connection, pages }: Props) {
  const [message, setMessage] = useState("");
  async function saveDefault(id: string) { await fetch("/api/facebook/default-page", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page_id: id }) }); setMessage("Default Facebook Page saved."); }
  async function disconnect() { await fetch("/api/facebook/disconnect", { method: "POST" }); window.location.reload(); }
  async function testPost() { const res = await fetch("/api/facebook/test-post", { method: "POST" }); const json = await res.json(); setMessage(res.ok ? `Test post status: ${json.status}` : json.error || "Test post failed."); }
  return <div className="space-y-6"><div><h1 className="text-4xl font-black">Facebook Auto Relay</h1><p className="mt-2 text-gray-500">Connect a Page, choose the default Page, and let BentaBoost post preview URLs after card creation.</p></div>{message && <p className="rounded-2xl bg-green-50 p-3 font-bold text-green-700">{message}</p>}{!configured && <div className="rounded-3xl bg-orange-50 p-5 font-bold text-orange-800">Facebook Auto Relay is not configured yet. Manual relay is still available.</div>}<section className="rounded-3xl bg-white p-6 shadow-card"><h2 className="text-2xl font-black">Connection status</h2><p className="mt-2 text-gray-600">{connection ? `Connected Facebook user: ${connection.facebook_user_name || "Connected user"}` : "No Facebook user connected."}</p><div className="mt-4 flex flex-wrap gap-2">{configured && <a href="/api/facebook/login" className="rounded-full brand-gradient px-5 py-3 font-black text-white">Connect Facebook</a>}{connection && <button onClick={disconnect} className="rounded-full bg-red-50 px-5 py-3 font-black text-red-700">Disconnect</button>}{connection && <button onClick={testPost} className="rounded-full bg-orange-50 px-5 py-3 font-black text-orange-700">Test Post</button>}</div></section><section className="rounded-3xl bg-white p-6 shadow-card"><h2 className="text-2xl font-black">Available Pages</h2><div className="mt-4 grid gap-3">{pages.map((page)=><label key={page.id} className="flex items-center justify-between gap-3 rounded-2xl border p-4"><span><b>{page.page_name}</b><br/><span className="text-sm text-gray-500">{page.page_url || page.facebook_page_id}</span></span><input type="radio" name="default" checked={page.is_default} onChange={()=>saveDefault(page.id)} /></label>)}{pages.length === 0 && <p className="text-gray-500">No Pages saved yet.</p>}</div></section></div>;
}
