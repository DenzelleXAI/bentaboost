import { ImageIcon, MessageCircle, MoreHorizontal, Share2, ThumbsUp } from "lucide-react";

type Props = { postCaption?: string; cardHeadline?: string; fakeDisplayLink?: string; imageUrl?: string };

export function FacebookLivePreview({ postCaption, cardHeadline, fakeDisplayLink, imageUrl }: Props) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full brand-gradient p-1"><div className="h-full w-full rounded-full bg-white/30" /></div>
          <div><p className="font-bold text-graphite">Plant</p><p className="text-xs text-gray-500">Sponsored · visual preview</p></div>
        </div>
        <MoreHorizontal className="text-gray-500" size={22} />
      </div>
      <p className="mb-4 min-h-6 whitespace-pre-wrap text-[15px] text-graphite">{postCaption || "What people see above the image..."}</p>
      <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-red-50">
        {imageUrl ? <img src={imageUrl} alt="Preview image" className="h-full w-full object-contain p-2" /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-orange-500"><ImageIcon size={48}/><span className="text-sm font-bold">Square image preview</span></div>}
      </div>
      <div className="rounded-b-2xl bg-gray-100 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">{fakeDisplayLink || "i.i"}</p>
        <h3 className="mt-1 text-lg font-extrabold leading-tight text-graphite">{cardHeadline || "Big bold headline below the image"}</h3>
      </div>
      <div className="flex items-center justify-between border-b border-gray-100 py-3 text-sm text-gray-500"><span>1.2K</span><span>89 comments · 34 shares</span></div>
      <div className="grid grid-cols-3 gap-2 pt-2 text-sm font-bold text-gray-600">
        <span className="flex justify-center gap-2 rounded-lg py-2 hover:bg-gray-50"><ThumbsUp size={16}/>Like</span>
        <span className="flex justify-center gap-2 rounded-lg py-2 hover:bg-gray-50"><MessageCircle size={16}/>Comment</span>
        <span className="flex justify-center gap-2 rounded-lg py-2 hover:bg-gray-50"><Share2 size={16}/>Share</span>
      </div>
    </div>
  );
}
