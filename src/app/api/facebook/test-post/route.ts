import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/config";
import { postToDefaultPage } from "@/lib/facebook";

export async function POST() {
  const result = await postToDefaultPage(SITE_URL);
  return NextResponse.json(result, { status: result.status === "failed" ? 500 : 200 });
}
