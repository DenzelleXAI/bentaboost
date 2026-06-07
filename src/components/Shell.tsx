import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

const nav = [
  ["Dashboard", "/dashboard"],
  ["Create", "/create"],
  ["Folders", "/folders"],
  ["Settings", "/settings"]
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-orange-100/80 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center"><BrandLogo className="h-12 w-44" /></Link>
          <nav className="hidden items-center gap-2 md:flex">
            {nav.map(([label, href]) => <Link key={href} href={href} className="rounded-full px-4 py-2 text-sm font700 text-graphite/75 hover:bg-white hover:text-graphite">{label}</Link>)}
          </nav>
          <Link href="/create" className="rounded-full brand-gradient px-4 py-2 text-sm font-bold text-white shadow-card">Create Link</Link>
        </div>
        <nav className="grid grid-cols-4 gap-1 px-3 pb-3 md:hidden">
          {nav.map(([label, href]) => <Link key={href} href={href} className="rounded-full bg-white px-2 py-2 text-center text-xs font-bold text-graphite/70 shadow-sm">{label}</Link>)}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
