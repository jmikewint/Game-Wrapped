import type {
  WrappedArchetype,
  WrappedRawData,
  WrappedStats,
  WrappedTopGame,
  WrappedTopGenre,
} from "@/types/wrapped";

type ArchetypeInput = {
  gameCount: number;
  totalHours: number;
  neverPlayedCount: number;
  backlogRatio: number;
  concentration: number;
  nightOwlRatio: number;
  earlyBirdRatio: number;
  sampledSessionCount: number;
  topGame: WrappedTopGame | null;
};

type ArchetypeRule = {
  weight: number;
  test: (s: ArchetypeInput) => boolean;
  build: (s: ArchetypeInput) => WrappedArchetype;
};

/**
 * Rule-based "you are..." generator — GameWrapped's take on a Spotify
 * Wrapped listening personality. Rules are checked in weight order and the
 * first match wins, so put more specific / more impressive claims first.
 * Every tagline is built from real numbers, never invented.
 */
const ARCHETYPE_RULES: ArchetypeRule[] = [
  {
    weight: 100,
    test: (s) => s.topGame !== null && s.concentration >= 0.55 && s.gameCount >= 3,
    build: (s) => ({
      title: "The One True Game",
      tagline: `${s.topGame!.name} alone accounts for ${Math.round(s.concentration * 100)}% of all your hours this year.`,
      emoji: "🎯",
    }),
  },
  {
    weight: 95,
    test: (s) => s.totalHours >= 800,
    build: (s) => ({
      title: "The Marathoner",
      tagline: `${s.totalHours.toLocaleString()} hours logged. Most people don't log that at their job.`,
      emoji: "🏃",
    }),
  },
  {
    weight: 90,
    test: (s) => s.gameCount >= 15 && s.backlogRatio >= 0.45,
    build: (s) => ({
      title: "The Collector",
      tagline: `${s.neverPlayedCount} of your ${s.gameCount} games are still sitting completely untouched.`,
      emoji: "📦",
    }),
  },
  {
    weight: 85,
    test: (s) => s.gameCount > 0 && s.gameCount <= 6 && s.totalHours >= 150,
    build: (s) => ({
      title: "The Loyalist",
      tagline: `Just ${s.gameCount} game${s.gameCount === 1 ? "" : "s"} — and you gave ${s.gameCount === 1 ? "it" : "them"} everything.`,
      emoji: "💜",
    }),
  },
  {
    weight: 80,
    test: (s) => s.sampledSessionCount >= 5 && s.nightOwlRatio >= 0.5,
    build: (s) => ({
      title: "The Night Owl",
      tagline: `${Math.round(s.nightOwlRatio * 100)}% of your sessions wrapped up between midnight and 5am.`,
      emoji: "🌙",
    }),
  },
  {
    weight: 75,
    test: (s) => s.sampledSessionCount >= 5 && s.earlyBirdRatio >= 0.4,
    build: (s) => ({
      title: "The Early Riser",
      tagline: `${Math.round(s.earlyBirdRatio * 100)}% of your sessions wrapped up before 9am. Coffee, then conquest.`,
      emoji: "🌅",
    }),
  },
  {
    weight: 70,
    test: (s) => s.gameCount >= 40 && s.backlogRatio < 0.3,
    build: (s) => ({
      title: "The Explorer",
      tagline: `A ${s.gameCount}-game library, and you actually played through almost all of it.`,
      emoji: "🧭",
    }),
  },
  {
    weight: 65,
    test: (s) => s.totalHours >= 300 && s.gameCount >= 20,
    build: (s) => ({
      title: "The Completionist",
      tagline: `${s.totalHours.toLocaleString()} hours spread across ${s.gameCount} games — steady, consistent, relentless.`,
      emoji: "🏆",
    }),
  },
];

const DEFAULT_ARCHETYPE: WrappedArchetype = {
  title: "The Steam Wanderer",
  tagline: "Your year didn't fit a single label — a little bit of everything.",
  emoji: "🎮",
};

function pickArchetype(input: ArchetypeInput): WrappedArchetype {
  let best: { weight: number; archetype: WrappedArchetype } | null = null;
  for (const rule of ARCHETYPE_RULES) {
    if (!rule.test(input)) continue;
    if (!best || rule.weight > best.weight) {
      best = { weight: rule.weight, archetype: rule.build(input) };
    }
  }
  return best?.archetype ?? DEFAULT_ARCHETYPE;
}

/**
 * Derives every recap stat — and the archetype — from raw owned-game data.
 * Runs on the client so time-of-day stats (Night Owl / Early Riser) reflect
 * the viewer's actual local timezone rather than the server's.
 */
export function computeWrappedStats(raw: WrappedRawData): WrappedStats {
  const games = raw.games;
  const gameCount = games.length;
  const totalMinutes = games.reduce((sum, g) => sum + g.minutes, 0);
  const totalHours = Math.round(totalMinutes / 60);

  const playedGames = games.filter((g) => g.minutes > 0);
  const neverPlayedCount = gameCount - playedGames.length;
  const backlogRatio = gameCount > 0 ? neverPlayedCount / gameCount : 0;

  const sorted = [...games].sort((a, b) => b.minutes - a.minutes);
  const topGames: WrappedTopGame[] = sorted
    .slice(0, 5)
    .filter((g) => g.minutes > 0)
    .map((g) => ({
      id: g.id,
      name: g.name,
      headerImage: g.headerImage,
      hours: Math.round(g.minutes / 60),
    }));
  const topGame = topGames[0] ?? null;
  const concentration =
    topGame && totalMinutes > 0 ? sorted[0].minutes / totalMinutes : 0;

  const sessionHours = games
    .filter((g) => g.lastPlayedAt)
    .map((g) => new Date(g.lastPlayedAt as string).getHours());
  const sampledSessionCount = sessionHours.length;
  const nightOwlRatio =
    sampledSessionCount > 0
      ? sessionHours.filter((h) => h >= 0 && h < 5).length / sampledSessionCount
      : 0;
  const earlyBirdRatio =
    sampledSessionCount > 0
      ? sessionHours.filter((h) => h >= 5 && h < 9).length / sampledSessionCount
      : 0;

  // A game can carry multiple genre tags; each one gets the game's full
  // minute total, same as how Spotify attributes a song to every genre it
  // fits rather than splitting credit. Only games that have been
  // genre-backfilled (see lib/library-sync.ts) contribute here, so this is
  // necessarily a partial picture for a library that isn't fully synced yet
  // — genreCoverageCount says how partial.
  const genreMinutes = new Map<string, { minutes: number; gameCount: number }>();
  let genreCoverageCount = 0;
  for (const g of games) {
    if (g.genres.length === 0) continue;
    genreCoverageCount += 1;
    for (const genre of g.genres) {
      const entry = genreMinutes.get(genre) ?? { minutes: 0, gameCount: 0 };
      entry.minutes += g.minutes;
      entry.gameCount += 1;
      genreMinutes.set(genre, entry);
    }
  }
  let topGenre: WrappedTopGenre | null = null;
  let topGenreMinutes = -1;
  for (const [name, { minutes, gameCount }] of genreMinutes) {
    if (minutes > topGenreMinutes) {
      topGenreMinutes = minutes;
      topGenre = { name, hours: Math.round(minutes / 60), gameCount };
    }
  }

  const archetype = pickArchetype({
    gameCount,
    totalHours,
    neverPlayedCount,
    backlogRatio,
    concentration,
    nightOwlRatio,
    earlyBirdRatio,
    sampledSessionCount,
    topGame,
  });

  return {
    year: raw.year,
    isEstimated: raw.isEstimated,
    totalMinutes,
    totalHours,
    gameCount,
    playedGameCount: playedGames.length,
    neverPlayedCount,
    backlogRatio,
    concentration,
    nightOwlRatio,
    earlyBirdRatio,
    topGames,
    topGame,
    topGenre,
    genreCoverageCount,
    achievementsThisYear: raw.achievementsThisYear,
    achievementsAllTime: raw.achievementsAllTime,
    achievementTrackedGameCount: raw.achievementTrackedGameCount,
    archetype,
  };
}
