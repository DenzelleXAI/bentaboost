import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, isServiceSupabaseConfigured } from "@/lib/supabase";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isServiceSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const body = await req.json();
  const { data, error } = await getSupabaseServerClient().from("folders").update({ name: body.name, description: body.description || null }).eq("id", params.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ folder: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!isServiceSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const supabase = getSupabaseServerClient();
  await supabase.from("posts").update({ folder_id: null }).eq("folder_id", params.id);
  const { error } = await supabase.from("folders").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
