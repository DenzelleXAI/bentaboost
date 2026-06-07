export type Folder = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  folder_id: string | null;
  slug: string;
  destination_url: string;
  post_caption: string | null;
  card_headline: string;
  fake_display_link: string | null;
  image_url: string;
  image_path: string | null;
  facebook_post_url: string | null;
  facebook_post_id: string | null;
  relay_status: "manual" | "ready" | "failed" | "posted" | string;
  relay_error: string | null;
  facebook_page_id: string | null;
  created_at: string;
  updated_at: string;
  folders?: Pick<Folder, "id" | "name"> | null;
};

export type ClickEvent = {
  id: string;
  post_id: string;
  clicked_at: string;
  referrer: string | null;
  user_agent: string | null;
};

export type FacebookConnection = {
  id: string;
  facebook_user_id: string | null;
  facebook_user_name: string | null;
  access_token_encrypted: string | null;
  created_at: string;
  updated_at: string;
};

export type FacebookPage = {
  id: string;
  facebook_connection_id: string | null;
  facebook_page_id: string;
  page_name: string;
  page_url: string | null;
  page_access_token_encrypted: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type PostWithClicks = Post & {
  clicks_today: number;
  clicks_7d: number;
  clicks_30d: number;
  clicks_all: number;
};
