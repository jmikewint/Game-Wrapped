import { prisma } from "@/lib/prisma";
import type { WrappedRawData } from "@/types/wrapped";

/**
 * Pulls a user's full owned-games list into the shape the Wrapped recap
 * needs. Intentionally dumb: no aggregation happens here — that's
 * `computeWrappedStats` in `lib/superlatives.ts`, which runs on the client
 * so it can factor in the viewer's local timezone (for things like the
 * "Night Owl" archetype).
 */
export async function getWrappedRawData(
  userId: string,
  displayName: string,
  avatarUrl: string | null,
): Promise<WrappedRawData> {
  const owned = await prisma.ownedGame.findMany({
    where: { userId },
    include: { game: true },
    orderBy: { playtimeForever: "desc" },
  });

  return {
    displayName,
    avatarUrl,
    games: owned.map((o) => ({
      id: o.gameId,
      name: o.game.name,
      headerImage: o.game.headerImage,
      minutes: o.playtimeForever,
      lastPlayedAt: o.lastPlayedAt ? o.lastPlayedAt.toISOString() : null,
    })),
  };
}
