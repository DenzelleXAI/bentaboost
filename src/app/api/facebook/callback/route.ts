import { NextRequest, NextResponse } from "next/server";
import { FACEBOOK_GRAPH_VERSION, SITE_URL } from "@/lib/config";
import { isFacebookConfigured, saveFacebookConnection } from "@/lib/facebook";

export async function GET(req: NextRequest) {
  if (!isFacebookConfigured()) return NextResponse.redirect(`${SITE_URL}/settings?facebook=not-configured`);
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(`${SITE_URL}/settings?facebook=missing-code`);
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${SITE_URL}/api/facebook/callback`;
  const tokenUrl = new URL(`https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/oauth/access_token`);
  tokenUrl.searchParams.set("client_id", process.env.FACEBOOK_APP_ID || "");
  tokenUrl.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET || "");
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);
  const tokenRes = await fetch(tokenUrl);
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok || !tokenJson.access_token) return NextResponse.redirect(`${SITE_URL}/settings?facebook=token-error`);
  const [userRes, pagesRes] = await Promise.all([
    fetch(`https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/me?fields=id,name&access_token=${tokenJson.access_token}`),
    fetch(`https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/me/accounts?fields=id,name,access_token,link&access_token=${tokenJson.access_token}`)
  ]);
  const user = await userRes.json();
  const pages = await pagesRes.json();
  await saveFacebookConnection(user, tokenJson.access_token, pages.data || []);
  return NextResponse.redirect(`${SITE_URL}/settings?facebook=connected`);
}
