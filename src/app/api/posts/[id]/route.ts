import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, isServiceSupabaseConfigured } from "@/lib/supabase";
import { slugify, validateFacebookPostUrl, validateFakeDisplayLink, validateShopeeUrl, validateSlug } from "@/lib/validation";

async function uploadImage(file: File, slug: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${slug}-${Date.now()}.${ext}`;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.storage.from("post-images").upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return { image_url: data.publicUrl, image_path: path };
}

async function ensureFolder(name: string) {
  if (!name.trim()) return null;
  const { data, error } = await getSupabaseServerClient().from("folders").insert({ name: name.trim() }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!isServiceSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data, error } = await getSupabaseServerClient().from("posts").select("*").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ post: data });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isServiceSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await req.json();
    if (json.facebook_post_url !== undefined && !validateFacebookPostUrl(json.facebook_post_url)) return NextResponse.json({ error: "Please paste a valid Facebook post/share URL." }, { status: 400 });
    const { data, error } = await getSupabaseServerClient().from("posts").update(json).eq("id", params.id).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: data });
  }
  const form = await req.formData();
  const destination_url = String(form.get("destination_url") || "");
  const fake_display_link = String(form.get("fake_display_link") || "");
  const slug = slugify(String(form.get("slug") || ""));
  const urlCheck = validateShopeeUrl(destination_url);
  if (!urlCheck.ok) return NextResponse.json({ error: urlCheck.message }, { status: 400 });
  if (!validateFakeDisplayLink(fake_display_link)) return NextResponse.json({ error: "Letters only, separated by a dot. e.g. i.i" }, { status: 400 });
  if (!validateSlug(slug)) return NextResponse.json({ error: "Slug must use lowercase letters, numbers, and hyphens only." }, { status: 400 });
  const image = form.get("image");
  const folder_id = await ensureFolder(String(form.get("new_folder") || "")) || String(form.get("folder_id") || "") || null;
  const update: Record<string, string | null> = { folder_id, destination_url, post_caption: String(form.get("post_caption") || ""), card_headline: String(form.get("card_headline") || ""), fake_display_link, slug };
  if (image instanceof File) Object.assign(update, await uploadImage(image, slug));
  const { data, error } = await getSupabaseServerClient().from("posts").update(update).eq("id", params.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!isServiceSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const supabase = getSupabaseServerClient();
  const { data: post } = await supabase.from("posts").select("image_path").eq("id", params.id).maybeSingle();
  const { error } = await supabase.from("posts").delete().eq("id", params.id);
  if (post?.image_path) await supabase.storage.from("post-images").remove([post.image_path]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
