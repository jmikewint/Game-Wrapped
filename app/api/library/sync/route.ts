import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { syncOwnedGames } from "@/lib/library-sync";

export async function POST(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  // Optional `redirectTo` form field lets callers (e.g. the /wrapped empty
  // state) send the user back to where they started instead of always "/".
  // Only same-site relative paths are honored to avoid an open redirect.
  const formData = await request.formData().catch(() => null);
  const requested = formData?.get("redirectTo");
  const redirectPath =
    typeof requested === "string" &&
    requested.startsWith("/") &&
    !requested.startsWith("//")
      ? requested
      : "/";

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

  return NextResponse.redirect(`${origin}${redirectPath}`, 303);
}
