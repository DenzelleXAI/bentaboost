import { NextResponse } from "next/server";
import { facebookLoginUrl, isFacebookConfigured } from "@/lib/facebook";

export async function GET() {
  if (!isFacebookConfigured()) return NextResponse.redirect(new URL("/settings?facebook=not-configured", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  return NextResponse.redirect(facebookLoginUrl());
}
