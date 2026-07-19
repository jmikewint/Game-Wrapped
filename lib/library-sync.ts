import { prisma } from "@/lib/prisma";
import { fetchOwnedGames, fetchPlayerAchievements, fetchAppGenres } from "@/lib/steam";

const BATCH_SIZE = 25;

// Achievements: re-checked every sync (a user's unlock progress keeps
// changing), but only for their most-played games. This keeps the number
// of Steam Web API calls bounded to a small constant regardless of how
// large someone's library is, rather than scaling with library size.
const ACHIEVEMENT_SYNC_LIMIT = 10;

// Genres: fetched via Steam's unofficial, unrate-limit-documented storefront
// API, so we (a) cache forever once fetched — genres essentially never
// change — and (b) only backfill a small batch per sync, spaced out with a
// delay, rather than hammering every missing game at once. A large library
// fills in its genre data gradually across several syncs instead of all at
// once.
const GENRE_BACKFILL_LIMIT = 8;
const GENRE_BACKFILL_DELAY_MS = 350;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function syncAchievements(
  userId: string,
  steamId: string,
  gameIdByAppId: Map<number, string>,
  playedGamesByPlaytime: { appId: number; playtimeForeverMinutes: number }[],
): Promise<void> {
  const targets = playedGamesByPlaytime
    .filter((g) => g.playtimeForeverMinutes > 0)
    .slice(0, ACHIEVEMENT_SYNC_LIMIT);

  for (const target of targets) {
    const gameId = gameIdByAppId.get(target.appId);
    if (!gameId) continue;

    let achievements;
    try {
      achievements = await fetchPlayerAchievements(steamId, target.appId);
    } catch (error) {
      console.error(
        `Failed to fetch achievements for appId ${target.appId}:`,
        error,
      );
      continue;
    }
    if (!achievements || achievements.length === 0) continue;

    for (const batch of chunk(achievements, BATCH_SIZE)) {
      await prisma.$transaction(
        batch.map((a) =>
          prisma.achievement.upsert({
            where: {
              userId_gameId_apiName: {
                userId,
                gameId,
                apiName: a.apiName,
              },
            },
            update: { achieved: a.achieved, unlockedAt: a.unlockedAt },
            create: {
              userId,
              gameId,
              apiName: a.apiName,
              achieved: a.achieved,
              unlockedAt: a.unlockedAt,
            },
          }),
        ),
      );
    }
  }
}

async function backfillGenres(
  gameIdByAppId: Map<number, string>,
  playedGamesByPlaytime: { appId: number; playtimeForeverMinutes: number }[],
): Promise<void> {
  const appIds = playedGamesByPlaytime.map((g) => g.appId);
  const existing = await prisma.game.findMany({
    where: { steamAppId: { in: appIds } },
    select: { id: true, steamAppId: true, genres: true },
  });
  const missingAppIds = new Set(
    existing.filter((g) => g.genres.length === 0).map((g) => g.steamAppId),
  );

  const targets = playedGamesByPlaytime
    .filter((g) => missingAppIds.has(g.appId))
    .slice(0, GENRE_BACKFILL_LIMIT);

  for (const [i, target] of targets.entries()) {
    const gameId = gameIdByAppId.get(target.appId);
    if (!gameId) continue;

    if (i > 0) await sleep(GENRE_BACKFILL_DELAY_MS);

    let genres: string[] | null = null;
    try {
      genres = await fetchAppGenres(target.appId);
    } catch (error) {
      console.error(`Failed to fetch genres for appId ${target.appId}:`, error);
      continue;
    }
    if (!genres || genres.length === 0) continue;

    await prisma.game.update({ where: { id: gameId }, data: { genres } });
  }
}

export type SyncResult = {
  syncedGames: number;
};

/**
 * Pulls the user's full Steam library and writes it into the DB:
 *  - upserts each Game's metadata (name, header image)
 *  - upserts the user's OwnedGame row (playtime, last played)
 *  - records a PlaySnapshot so a later "this year" recap can diff against it
 *  - syncs achievement unlock state for the user's most-played games
 *  - backfills genre tags for games that don't have them cached yet
 *
 * Safe to call repeatedly — every write here is an upsert or an append-only
 * snapshot, so re-syncing just refreshes playtime numbers (and gradually
 * fills in more achievement/genre coverage for large libraries).
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

  const byPlaytimeDesc = [...games]
    .sort((a, b) => b.playtimeForeverMinutes - a.playtimeForeverMinutes)
    .map((g) => ({
      appId: g.appId,
      playtimeForeverMinutes: g.playtimeForeverMinutes,
    }));

  // Best-effort — a failure here shouldn't fail the whole sync, since the
  // core owned-games data above already succeeded and is the important part.
  try {
    await syncAchievements(userId, steamId, gameIdByAppId, byPlaytimeDesc);
  } catch (error) {
    console.error("Achievement sync failed:", error);
  }
  try {
    await backfillGenres(gameIdByAppId, byPlaytimeDesc);
  } catch (error) {
    console.error("Genre backfill failed:", error);
  }

  return { syncedGames: games.length };
}
