import { NextRequest, NextResponse } from "next/server";
import { verifySteamAssertion, fetchSteamProfile } from "@/lib/steam";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  const steamId = await verifySteamAssertion(url.searchParams);
  if (!steamId) {
    return NextResponse.redirect(`${origin}/?auth_error=verification_failed`);
  }

  const profile = await fetchSteamProfile(steamId);
  if (!profile) {
    return NextResponse.redirect(`${origin}/?auth_error=profile_unavailable`);
  }

  const user = await prisma.user.upsert({
    where: { steamId: profile.steamId },
    update: {
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      profileUrl: profile.profileUrl,
    },
    create: {
      steamId: profile.steamId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      profileUrl: profile.profileUrl,
    },
  });

  await createSession(user.id);

  return NextResponse.redirect(origin);
}
