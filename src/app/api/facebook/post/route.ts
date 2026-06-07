import { NextRequest, NextResponse } from "next/server";
import { postToDefaultPage } from "@/lib/facebook";

export async function POST(req: NextRequest) {
  const { preview_url } = await req.json();
  if (!preview_url) return NextResponse.json({ error: "preview_url is required" }, { status: 400 });
  const result = await postToDefaultPage(preview_url);
  return NextResponse.json(result, { status: result.status === "failed" ? 500 : 200 });
}
