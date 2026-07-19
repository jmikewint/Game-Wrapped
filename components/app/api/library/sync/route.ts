import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { syncOwnedGames } from "@/lib/library-sync";

export async function POST(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/?auth_error=not_signed_in`, 303);
  }

  try {
    await syncOwnedGames(user.id, user.steamId);
  } catch (error) {
    console.error("Manual library sync failed:", error);
    return NextResponse.redirect(`${origin}/?auth_error=sync_failed`, 303);
  }

  return NextResponse.redirect(origin, 303);
}
