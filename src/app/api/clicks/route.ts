import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, isServiceSupabaseConfigured } from "@/lib/supabase";
import { isBotUserAgent } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") || "";
    if (isBotUserAgent(ua)) return NextResponse.json({ ok: true, ignored: true });
    const body = await req.json();
    if (!body.post_id) return NextResponse.json({ error: "post_id is required" }, { status: 400 });
    if (isServiceSupabaseConfigured()) await getSupabaseServerClient().from("click_events").insert({ post_id: body.post_id, referrer: req.headers.get("referer"), user_agent: ua });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
