import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/config";
import { postToDefaultPage } from "@/lib/facebook";
import { getSupabaseServerClient, isServiceSupabaseConfigured } from "@/lib/supabase";
import { slugify, validateFakeDisplayLink, validateShopeeUrl, validateSlug } from "@/lib/validation";

async function ensureFolder(name: string) {
  if (!name.trim()) return null;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("folders").insert({ name: name.trim() }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

async function uploadImage(file: File, slug: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${slug}-${Date.now()}.${ext}`;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.storage.from("post-images").upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return { image_url: data.publicUrl, image_path: path };
}

export async function GET() {
  if (!isServiceSupabaseConfigured()) return NextResponse.json({ posts: [] });
  const { data, error } = await getSupabaseServerClient().from("posts").select("*, folders(id,name)").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

export async function POST(req: NextRequest) {
  if (!isServiceSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const form = await req.formData();
  const destination_url = String(form.get("destination_url") || "");
  const post_caption = String(form.get("post_caption") || "");
  const card_headline = String(form.get("card_headline") || "");
  const fake_display_link = String(form.get("fake_display_link") || "");
  const slug = slugify(String(form.get("slug") || card_headline));
  const image = form.get("image");
  const urlCheck = validateShopeeUrl(destination_url);
  if (!urlCheck.ok) return NextResponse.json({ error: urlCheck.message }, { status: 400 });
  if (!validateFakeDisplayLink(fake_display_link)) return NextResponse.json({ error: "Letters only, separated by a dot. e.g. i.i" }, { status: 400 });
  if (!validateSlug(slug)) return NextResponse.json({ error: "Slug must use lowercase letters, numbers, and hyphens only." }, { status: 400 });
  if (!(image instanceof File)) return NextResponse.json({ error: "Please upload an image." }, { status: 400 });
  const folder_id = await ensureFolder(String(form.get("new_folder") || "")) || String(form.get("folder_id") || "") || null;
  const uploaded = await uploadImage(image, slug);
  const supabase = getSupabaseServerClient();
  const { data: post, error } = await supabase.from("posts").insert({ folder_id, destination_url, post_caption, card_headline, fake_display_link, slug, ...uploaded, relay_status: "manual" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const relay = await postToDefaultPage(`${SITE_URL}/p/${slug}`);
  let relayWarning = "";
  if (relay.status !== "manual") {
    const relayError = "error" in relay ? relay.error || null : null;
    const facebookPostId = "facebook_post_id" in relay ? relay.facebook_post_id || null : null;
    const facebookPostUrl = "facebook_post_url" in relay ? relay.facebook_post_url || null : null;
    await supabase.from("posts").update({ relay_status: relay.status, relay_error: relayError, facebook_post_id: facebookPostId, facebook_post_url: facebookPostUrl }).eq("id", post.id);
    if (relay.status === "failed") relayWarning = relayError || "Facebook Auto Relay failed. Manual relay is still available.";
  }
  return NextResponse.json({ post, relayWarning });
}
