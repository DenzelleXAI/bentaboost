import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RedirectBridge } from "@/components/RedirectBridge";
import { SITE_URL } from "@/lib/config";
import { fetchPostBySlug } from "@/lib/data";

function cleanDomainLabel() {
  try { return new URL(SITE_URL).hostname.replace(/^www\./, ""); } catch { return "BentaBoost"; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug);
  if (!post) return { title: "Opening..." };
  const url = `${SITE_URL}/p/${post.slug}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: post.card_headline,
    description: post.post_caption || "",
    openGraph: { title: post.card_headline, description: post.post_caption || "", images: [post.image_url], url, type: "website", siteName: post.fake_display_link || cleanDomainLabel() },
    twitter: { card: "summary_large_image", title: post.card_headline, description: post.post_caption || "", images: [post.image_url] }
  };
}

export default async function PublicPreviewPage({ params }: { params: { slug: string } }) {
  const post = await fetchPostBySlug(params.slug);
  if (!post) notFound();
  return <RedirectBridge postId={post.id} destinationUrl={post.destination_url} />;
}
