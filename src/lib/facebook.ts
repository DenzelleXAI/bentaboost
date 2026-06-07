import { FACEBOOK_GRAPH_VERSION, FACEBOOK_SCOPES, SITE_URL } from "./config";
import { decryptToken, encryptToken } from "./crypto";
import { getSupabaseServerClient, isServiceSupabaseConfigured } from "./supabase";
import type { FacebookPage } from "./types";

export function isFacebookConfigured() {
  return Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && process.env.FACEBOOK_REDIRECT_URI && process.env.TOKEN_ENCRYPTION_SECRET && isServiceSupabaseConfigured());
}

export function facebookLoginUrl() {
  const redirect = process.env.FACEBOOK_REDIRECT_URI || `${SITE_URL}/api/facebook/callback`;
  const url = new URL(`https://www.facebook.com/${FACEBOOK_GRAPH_VERSION}/dialog/oauth`);
  url.searchParams.set("client_id", process.env.FACEBOOK_APP_ID || "");
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("scope", FACEBOOK_SCOPES.join(","));
  url.searchParams.set("response_type", "code");
  return url.toString();
}

export async function postToDefaultPage(previewUrl: string) {
  if (!isFacebookConfigured()) return { status: "manual" as const };
  const supabase = getSupabaseServerClient();
  const { data: page } = await supabase.from("facebook_pages").select("*").eq("is_default", true).maybeSingle();
  if (!page?.page_access_token_encrypted) return { status: "ready" as const };
  const token = decryptToken(page.page_access_token_encrypted);
  const res = await fetch(`https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/${page.facebook_page_id}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link: previewUrl, access_token: token })
  });
  const json = await res.json();
  if (!res.ok || !json.id) return { status: "failed" as const, error: json.error?.message || "Facebook relay failed." };
  return { status: "posted" as const, facebook_post_id: json.id as string, facebook_post_url: `https://www.facebook.com/${json.id}` };
}

export async function saveFacebookConnection(user: { id?: string; name?: string }, token: string, pages: Array<{ id: string; name: string; access_token: string; link?: string }>) {
  const supabase = getSupabaseServerClient();
  await supabase.from("facebook_pages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("facebook_connections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { data: connection, error } = await supabase.from("facebook_connections").insert({ facebook_user_id: user.id, facebook_user_name: user.name, access_token_encrypted: encryptToken(token) }).select("*").single();
  if (error) throw error;
  if (pages.length) {
    await supabase.from("facebook_pages").insert(pages.map((page, index) => ({ facebook_connection_id: connection.id, facebook_page_id: page.id, page_name: page.name, page_url: page.link, page_access_token_encrypted: encryptToken(page.access_token), is_default: index === 0 })));
  }
}

export async function getFacebookSettings() {
  if (!isServiceSupabaseConfigured()) return { configured: isFacebookConfigured(), connection: null, pages: [] as FacebookPage[] };
  const supabase = getSupabaseServerClient();
  const [connection, pages] = await Promise.all([
    supabase.from("facebook_connections").select("id,facebook_user_id,facebook_user_name,created_at,updated_at").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("facebook_pages").select("id,facebook_connection_id,facebook_page_id,page_name,page_url,is_default,created_at,updated_at").order("page_name")
  ]);
  return { configured: isFacebookConfigured(), connection: connection.data, pages: (pages.data || []) as FacebookPage[] };
}
