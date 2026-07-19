import { prisma } from "@/lib/prisma";
import { fetchOwnedGames } from "@/lib/steam";

const BATCH_SIZE = 25;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export type SyncResult = {
  syncedGames: number;
};

/**
 * Pulls the user's full Steam library and writes it into the DB:
 *  - upserts each Game's metadata (name, header image)
 *  - upserts the user's OwnedGame row (playtime, last played)
 *  - records a PlaySnapshot so a later "this year" recap can diff against it
 *
 * Safe to call repeatedly — every write here is an upsert or an append-only
 * snapshot, so re-syncing just refreshes playtime numbers.
 */
export async function syncOwnedGames(
  userId: string,
  steamId: string,
): Promise<SyncResult> {
  const games = await fetchOwnedGames(steamId);
  if (games.length === 0) {
    return { syncedGames: 0 };
  }

  for (const batch of chunk(games, BATCH_SIZE)) {
    await prisma.$transaction(
      batch.map((g) =>
        prisma.game.upsert({
          where: { steamAppId: g.appId },
          update: { name: g.name, headerImage: g.headerImage },
          create: {
            steamAppId: g.appId,
            name: g.name,
            headerImage: g.headerImage,
          },
        }),
      ),
    );
  }

  const dbGames = await prisma.game.findMany({
    where: { steamAppId: { in: games.map((g) => g.appId) } },
    select: { id: true, steamAppId: true },
  });
  const gameIdByAppId = new Map(dbGames.map((g) => [g.steamAppId, g.id]));

  for (const batch of chunk(games, BATCH_SIZE)) {
    await prisma.$transaction(
      batch.map((g) => {
        const gameId = gameIdByAppId.get(g.appId);
        if (!gameId) {
          throw new Error(`Game ${g.appId} was not upserted before sync`);
        }
        return prisma.ownedGame.upsert({
          where: { userId_gameId: { userId, gameId } },
          update: {
            playtimeForever: g.playtimeForeverMinutes,
            playtimeTwoWeeks: g.playtimeTwoWeeksMinutes,
            lastPlayedAt: g.lastPlayedAt,
          },
          create: {
            userId,
            gameId,
            playtimeForever: g.playtimeForeverMinutes,
            playtimeTwoWeeks: g.playtimeTwoWeeksMinutes,
            lastPlayedAt: g.lastPlayedAt,
          },
        });
      }),
    );
  }

  await prisma.playSnapshot.createMany({
    data: games.map((g) => ({
      userId,
      gameId: gameIdByAppId.get(g.appId) as string,
      playtimeTotal: g.playtimeForeverMinutes,
    })),
  });

  return { syncedGames: games.length };
}
