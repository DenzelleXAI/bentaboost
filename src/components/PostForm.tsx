"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FacebookLivePreview } from "./FacebookLivePreview";
import type { Folder, Post } from "@/lib/types";
import { slugify, validateFakeDisplayLink, validateShopeeUrl, validateSlug } from "@/lib/validation";

type Props = { folders: Folder[]; initialPost?: Post | null };

export function PostForm({ folders, initialPost }: Props) {
  const router = useRouter();
  const [folderId, setFolderId] = useState(initialPost?.folder_id || "");
  const [newFolder, setNewFolder] = useState("");
  const [destinationUrl, setDestinationUrl] = useState(initialPost?.destination_url || "");
  const [postCaption, setPostCaption] = useState(initialPost?.post_caption || "");
  const [cardHeadline, setCardHeadline] = useState(initialPost?.card_headline || "");
  const [fakeDisplayLink, setFakeDisplayLink] = useState(initialPost?.fake_display_link || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialPost?.image_url || "");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initialPost);
  const headlineSlug = useMemo(() => slugify(cardHeadline), [cardHeadline]);

  function updateHeadline(value: string) {
    setCardHeadline(value);
    if (!isEdit && (!slug || slug === headlineSlug)) setSlug(slugify(value));
  }

  function onImage(file?: File) {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setWarning("");
    const urlCheck = validateShopeeUrl(destinationUrl);
    if (!urlCheck.ok) return setError(urlCheck.message);
    if (!validateFakeDisplayLink(fakeDisplayLink)) return setError("Letters only, separated by a dot. e.g. i.i");
    if (!validateSlug(slug)) return setError("Slug must use lowercase letters, numbers, and hyphens only.");
    if (!imageFile && !initialPost?.image_url) return setError("Please upload an image.");
    setSubmitting(true);
    const body = new FormData();
    body.set("folder_id", folderId);
    body.set("new_folder", newFolder);
    body.set("destination_url", destinationUrl);
    body.set("post_caption", postCaption);
    body.set("card_headline", cardHeadline);
    body.set("fake_display_link", fakeDisplayLink);
    body.set("slug", slug);
    if (imageFile) body.set("image", imageFile);
    const res = await fetch(isEdit ? `/api/posts/${initialPost?.id}` : "/api/posts", { method: isEdit ? "PATCH" : "POST", body });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) return setError(json.error || "Something went wrong.");
    if (json.relayWarning) setWarning(json.relayWarning);
    router.push(`/dashboard?success=${encodeURIComponent(isEdit ? "Preview updated" : "Preview card created")}`);
    router.refresh();
  }

  return <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
    <form onSubmit={submit} className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
      <div className="mb-6"><h1 className="text-3xl font-black text-graphite">{isEdit ? "Edit preview card" : "Create preview card"}</h1><p className="mt-2 text-gray-500">Build one custom preview URL for a Shopee product link.</p></div>
      {error && <p className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      {warning && <p className="mb-4 rounded-2xl bg-orange-50 p-3 text-sm font-bold text-orange-700">{warning}</p>}
      <div className="grid gap-5">
        <label className="grid gap-2"><span className="font-bold">Product Folder</span><select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="rounded-2xl border border-orange-100 px-4 py-3"><option value="">Unfoldered</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label>
        <label className="grid gap-2"><span className="font-bold">Quick create new folder</span><input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="New folder name" className="rounded-2xl border border-orange-100 px-4 py-3" /></label>
        <label className="grid gap-2"><span className="font-bold">Destination Link</span><input required value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} placeholder="https://s.shopee.ph/xxxxx" className="rounded-2xl border border-orange-100 px-4 py-3" /><span className="text-xs text-gray-500">For best app-opening behavior, use the Shopee app share link starting with https://s.shopee.ph/ or https://ph.shp.ee/.</span></label>
        <label className="grid gap-2"><span className="font-bold">Post Caption</span><textarea value={postCaption} onChange={(e) => setPostCaption(e.target.value)} placeholder="What people see above the image..." rows={4} className="rounded-2xl border border-orange-100 px-4 py-3" /></label>
        <label className="grid gap-2"><span className="font-bold">Card Headline</span><input required value={cardHeadline} onChange={(e) => updateHeadline(e.target.value)} placeholder="Big bold headline below the image" className="rounded-2xl border border-orange-100 px-4 py-3" /></label>
        <label className="grid gap-2"><span className="font-bold">Fake Display Link</span><input value={fakeDisplayLink} onChange={(e) => setFakeDisplayLink(e.target.value)} placeholder="i.i" className="rounded-2xl border border-orange-100 px-4 py-3" /><span className="text-xs text-gray-500">Letters only, separated by a dot. e.g. i.i Facebook may still choose to show your real domain.</span></label>
        <label className="grid gap-2"><span className="font-bold">Image</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onImage(e.target.files?.[0])} className="rounded-2xl border border-dashed border-orange-200 px-4 py-3" /><span className="text-xs text-gray-500">Auto-fits to 1:1 square.</span></label>
        <label className="grid gap-2"><span className="font-bold">Slug</span><input required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} className="rounded-2xl border border-orange-100 px-4 py-3" /></label>
      </div>
      <button disabled={submitting} className="mt-8 w-full rounded-full brand-gradient px-6 py-4 font-black text-white shadow-card disabled:opacity-60 sm:w-auto">{submitting ? "Saving..." : isEdit ? "Update Preview" : "Create Link"}</button>
    </form>
    <aside className="lg:sticky lg:top-28 lg:self-start"><FacebookLivePreview postCaption={postCaption} cardHeadline={cardHeadline} fakeDisplayLink={fakeDisplayLink} imageUrl={imagePreview} /></aside>
  </div>;
}
