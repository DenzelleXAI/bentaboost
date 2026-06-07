import { BRAND } from "@/lib/config";

type Props = { withTagline?: boolean; className?: string };

export function BrandLogo({ withTagline = false, className = "h-12 w-44" }: Props) {
  const src = withTagline ? BRAND.logoWithTagline : BRAND.logoNoTagline;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src={src} alt="BentaBoost" className="safe-logo h-full w-full" />
      <span className="sr-only">BentaBoost</span>
      <span aria-hidden="true" className="hidden font-black text-2xl text-graphite [img+&]:hidden">BentaBoost</span>
    </div>
  );
}
