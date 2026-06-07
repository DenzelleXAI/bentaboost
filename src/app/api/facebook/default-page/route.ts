import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, isServiceSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!isServiceSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { page_id } = await req.json();
  const supabase = getSupabaseServerClient();
  await supabase.from("facebook_pages").update({ is_default: false }).neq("id", page_id);
  const { error } = await supabase.from("facebook_pages").update({ is_default: true }).eq("id", page_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
