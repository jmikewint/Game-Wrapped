import { prisma } from "@/lib/prisma";
import type { WrappedRawData } from "@/types/wrapped";

/** Midnight UTC on Jan 1 of the current year — the recap window boundary. */
function startOfCurrentYear(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
}

/**
 * Pulls a user's owned-games list and scopes each game's playtime to the
 * current calendar year, rather than returning lifetime totals.
 *
 * `library-sync.ts` writes a `PlaySnapshot` (a point-in-time all-time
 * playtime reading) on every library sync. To get "this year" hours for a
 * game we take its most recent snapshot from *before* the year started as
 * a baseline and diff it against the current all-time total:
 *
 *   minutesThisYear = playtimeForever(now) - playtimeForever(baseline)
 *
 * If no such baseline exists for a game, we fall back to its lifetime
 * playtime. That fallback is *correct*, not approximate, for a game the
 * user only started playing this year (there's nothing to subtract). It's
 * only genuinely an estimate when the user has no pre-year snapshot at
 * all — i.e. they only started using GameWrapped this year — which is
 * surfaced via `isEstimated` so the UI can caveat it.
 *
 * Intentionally dumb beyond that: no per-game aggregation happens here —
 * that's `computeWrappedStats` in `lib/superlatives.ts`, which runs on the
 * client so it can factor in the viewer's local timezone (for things like
 * the "Night Owl" archetype). The two exceptions are the achievement
 * counts below, which have to be summed here while we still have
 * Prisma's `Date` objects — `unlockedAt` gets serialized to an ISO string
 * on individual games, but there's no per-game achievement breakdown to
 * carry across that boundary anyway, just the two totals.
 */
export async function getWrappedRawData(
  userId: string,
  displayName: string,
  avatarUrl: string | null,
): Promise<WrappedRawData> {
  const yearStart = startOfCurrentYear();

  const [owned, baselineSnapshots, achievementStats] = await Promise.all([
    prisma.ownedGame.findMany({
      where: { userId },
      include: { game: true },
      orderBy: { playtimeForever: "desc" },
    }),
    // The newest snapshot per game from *before* the year started. Ordering
    // by capturedAt desc and taking the first hit per gameId below gives us
    // exactly that without a second query per game.
    prisma.playSnapshot.findMany({
      where: { userId, capturedAt: { lt: yearStart } },
      orderBy: { capturedAt: "desc" },
      select: { gameId: true, playtimeTotal: true },
    }),
    // Achievement coverage is intentionally partial — only a user's
    // most-played games get synced (see lib/library-sync.ts) — so we also
    // report how many distinct games contributed, letting the UI caveat
    // the number honestly rather than implying full-library coverage.
    prisma.achievement.findMany({
      where: { userId, achieved: true },
      select: { gameId: true, unlockedAt: true },
    }),
  ]);

  const baselineByGameId = new Map<string, number>();
  for (const snap of baselineSnapshots) {
    if (!baselineByGameId.has(snap.gameId)) {
      baselineByGameId.set(snap.gameId, snap.playtimeTotal);
    }
  }

  // No pre-year snapshot for *any* game means this user has no tracking
  // history from before the year began — every "this year" number below is
  // really just lifetime playtime standing in for it.
  const isEstimated = baselineSnapshots.length === 0;

  const games = owned.map((o) => {
    const baseline = baselineByGameId.get(o.gameId);
    const minutesThisYear =
      baseline === undefined
        ? o.playtimeForever
        : // Clamp at 0 in case a game's reported total ever moves backwards
          // (e.g. Steam-side stats reset) — never show negative hours.
          Math.max(0, o.playtimeForever - baseline);

    return {
      id: o.gameId,
      name: o.game.name,
      headerImage: o.game.headerImage,
      genres: o.game.genres,
      minutes: minutesThisYear,
      lastPlayedAt: o.lastPlayedAt ? o.lastPlayedAt.toISOString() : null,
    };
  });

  const achievementsAllTime = achievementStats.length;
  const achievementsThisYear = achievementStats.filter(
    (a) => a.unlockedAt && a.unlockedAt >= yearStart,
  ).length;
  const achievementTrackedGameCount = new Set(
    achievementStats.map((a) => a.gameId),
  ).size;

  return {
    displayName,
    avatarUrl,
    year: yearStart.getUTCFullYear(),
    isEstimated,
    games,
    achievementsThisYear,
    achievementsAllTime,
    achievementTrackedGameCount,
  };
}
