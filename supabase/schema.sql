create extension if not exists pgcrypto;

create table if not exists folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists facebook_connections (
  id uuid primary key default gen_random_uuid(),
  facebook_user_id text,
  facebook_user_name text,
  access_token_encrypted text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists facebook_pages (
  id uuid primary key default gen_random_uuid(),
  facebook_connection_id uuid references facebook_connections(id) on delete cascade,
  facebook_page_id text not null,
  page_name text not null,
  page_url text,
  page_access_token_encrypted text,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references folders(id) on delete set null,
  slug text unique not null,
  destination_url text not null,
  post_caption text,
  card_headline text not null,
  fake_display_link text,
  image_url text not null,
  image_path text,
  facebook_post_url text,
  facebook_post_id text,
  relay_status text default 'manual',
  relay_error text,
  facebook_page_id uuid references facebook_pages(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists click_events (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  clicked_at timestamptz default now(),
  referrer text,
  user_agent text
);

create index if not exists posts_slug_idx on posts(slug);
create index if not exists posts_folder_id_idx on posts(folder_id);
create index if not exists click_events_post_id_idx on click_events(post_id);
create index if not exists click_events_clicked_at_idx on click_events(clicked_at);
create index if not exists facebook_pages_facebook_page_id_idx on facebook_pages(facebook_page_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_folders_updated_at on folders;
create trigger set_folders_updated_at before update on folders for each row execute function set_updated_at();

drop trigger if exists set_posts_updated_at on posts;
create trigger set_posts_updated_at before update on posts for each row execute function set_updated_at();

drop trigger if exists set_facebook_connections_updated_at on facebook_connections;
create trigger set_facebook_connections_updated_at before update on facebook_connections for each row execute function set_updated_at();

drop trigger if exists set_facebook_pages_updated_at on facebook_pages;
create trigger set_facebook_pages_updated_at before update on facebook_pages for each row execute function set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];
