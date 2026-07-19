import { NextRequest, NextResponse } from "next/server";
import { getSteamAuthUrl } from "@/lib/steam";

export async function GET(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const returnTo = `${origin}/api/auth/steam/callback`;
  return NextResponse.redirect(getSteamAuthUrl(returnTo, origin));
}
