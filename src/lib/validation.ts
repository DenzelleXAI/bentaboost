const SHOPEE_DOMAINS = new Set(["shopee.ph", "www.shopee.ph", "s.shopee.ph", "ph.shp.ee"]);
const FACEBOOK_PREFIXES = ["https://www.facebook.com/", "https://facebook.com/", "https://m.facebook.com/"];

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "preview-card";
}

export function validateSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function validateShopeeUrl(value: string): { ok: true } | { ok: false; message: string } {
  if (!value.startsWith("https://")) return { ok: false, message: "Please use a secure https:// Shopee link." };
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return { ok: false, message: "Please use a secure https:// Shopee link." };
    if (!SHOPEE_DOMAINS.has(parsed.hostname.toLowerCase())) return { ok: false, message: "Only Shopee links are allowed." };
    return { ok: true };
  } catch {
    return { ok: false, message: "For best app-opening behavior, use a short Shopee share link like https://s.shopee.ph/xxxxx." };
  }
}

export function isShortShopeeShare(value: string) {
  return value.startsWith("https://s.shopee.ph/") || value.startsWith("https://ph.shp.ee/");
}

export function validateFakeDisplayLink(value: string) {
  return value === "" || /^[a-zA-Z]+\.[a-zA-Z]+$/.test(value);
}

export function validateFacebookPostUrl(value: string) {
  return value === "" || FACEBOOK_PREFIXES.some((prefix) => value.startsWith(prefix));
}

export function isLocalhostUrl(value: string) {
  try {
    const host = new URL(value).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

export function isBotUserAgent(ua: string) {
  const lowered = ua.toLowerCase();
  return ["facebookexternalhit", "facebot", "twitterbot", "linkedinbot", "slackbot", "discordbot", "whatsapp", "telegrambot", "crawler", "bot", "spider"].some((needle) => lowered.includes(needle));
}
