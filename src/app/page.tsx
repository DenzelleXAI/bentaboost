import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, FolderOpen, ImagePlus, Share2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { FacebookLivePreview } from "@/components/FacebookLivePreview";

const features: Array<[ComponentType<{ className?: string }>, string]> = [
  [ImagePlus, "Custom Preview"],
  [ArrowRight, "Shopee Redirect"],
  [FolderOpen, "Product Folders"],
  [BarChart3, "Click Analytics"]
];

export default function Home() {
  return <main className="min-h-screen overflow-hidden bg-cream">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between"><BrandLogo className="h-14 w-48" /><Link href="/dashboard" className="rounded-full bg-white px-5 py-2 text-sm font-bold shadow-card">Dashboard</Link></header>
      <section className="grid items-center gap-12 py-14 lg:grid-cols-[1fr_480px] lg:py-24">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow-sm">Boost your benta. Share to success.</p>
          <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-graphite sm:text-7xl">Boost your benta.<br/><span className="text-gradient">Share to success.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">Create beautiful Facebook preview links that redirect buyers to your Shopee products and help you track what performs.</p>
          <div className="mt-8 grid gap-3 sm:flex"><Link href="/create" className="rounded-full brand-gradient px-7 py-4 text-center font-black text-white shadow-soft">Create Your First Preview</Link><Link href="/dashboard" className="rounded-full bg-white px-7 py-4 text-center font-black text-graphite shadow-card">View Dashboard</Link></div>
        </div>
        <div className="relative"><div className="absolute -left-8 top-1/3 hidden h-20 w-20 rotate-12 rounded-full brand-gradient opacity-20 blur-xl lg:block"/><FacebookLivePreview postCaption="Fresh finds for your next budol cart ✨" cardHeadline="Seller-favorite deal ready for checkout" fakeDisplayLink="i.i" /><div className="absolute -right-5 -top-5 rounded-full brand-gradient px-5 py-3 font-black text-white shadow-soft">↗</div></div>
      </section>
      <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">{features.map(([Icon, label]) => <div key={label} className="rounded-3xl bg-white p-6 shadow-card"><Icon className="text-orange-500"/><h3 className="mt-4 font-black text-graphite">{label}</h3></div>)}</section>
    </div>
  </main>;
}
