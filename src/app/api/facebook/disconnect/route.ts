import { NextResponse } from "next/server";
import { getSupabaseServerClient, isServiceSupabaseConfigured } from "@/lib/supabase";

export async function POST() {
  if (isServiceSupabaseConfigured()) {
    const supabase = getSupabaseServerClient();
    await supabase.from("facebook_pages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("facebook_connections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }
  return NextResponse.json({ ok: true });
}
