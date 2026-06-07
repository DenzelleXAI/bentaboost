import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, isServiceSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isServiceSupabaseConfigured()) return NextResponse.json({ folders: [] });
  const { data, error } = await getSupabaseServerClient().from("folders").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ folders: data });
}

export async function POST(req: NextRequest) {
  if (!isServiceSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const body = await req.json();
  const { data, error } = await getSupabaseServerClient().from("folders").insert({ name: body.name, description: body.description || null }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ folder: data });
}
