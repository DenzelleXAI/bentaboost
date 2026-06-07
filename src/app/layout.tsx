import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME, BRAND, SITE_URL, TAGLINE } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: APP_NAME,
  description: TAGLINE,
  icons: { icon: BRAND.favicon }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
