import { NextResponse } from "next/server";
import { getFacebookSettings } from "@/lib/facebook";

export async function GET() {
  return NextResponse.json(await getFacebookSettings());
}
