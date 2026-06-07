export const APP_NAME = "BentaBoost";
export const TAGLINE = "Boost your benta. Share to success.";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const BRAND = {
  logoNoTagline: "/brand/main-logo-no-tagline.png",
  logoWithTagline: "/brand/main-logo-with-tagline.png",
  submarkSquare: "/brand/submark-square.png",
  submarkCircle: "/brand/submark-circle.png",
  appIcon: "/brand/app-icon.png",
  favicon: "/brand/favicon.png",
  buttonIconsPanel: "/brand/button-icons-panel.png"
};

export const FACEBOOK_GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || "v20.0";
export const FACEBOOK_SCOPES = ["pages_show_list", "pages_read_engagement", "pages_manage_posts"];
