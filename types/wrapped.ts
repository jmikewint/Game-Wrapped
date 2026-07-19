// Types for the "Wrapped" recap experience — the animated, slide-by-slide
// reveal a signed-in user sees at /wrapped. Kept separate from the static
// landing-page placeholder types in `types/stats.ts`.

/** A single owned game, normalized for the recap. Dates are ISO strings so
 * this shape can cross the server → client component boundary cleanly. */
export type WrappedGame = {
  id: string;
  name: string;
  headerImage: string | null;
  minutes: number;
  lastPlayedAt: string | null;
};

/** Raw per-user data fetched on the server and handed to the client-side
 * recap experience, which derives every stat and the archetype from it. */
export type WrappedRawData = {
  displayName: string;
  avatarUrl: string | null;
  games: WrappedGame[];
};

export type WrappedTopGame = {
  id: string;
  name: string;
  headerImage: string | null;
  hours: number;
};

/** A fun, rule-based "you are..." label — GameWrapped's answer to Spotify
 * Wrapped's listening personality. Generated from real stats, not stored. */
export type WrappedArchetype = {
  title: string;
  tagline: string;
  emoji: string;
};

/** Everything a slide needs to render, derived once from `WrappedRawData`. */
export type WrappedStats = {
  totalMinutes: number;
  totalHours: number;
  gameCount: number;
  playedGameCount: number;
  neverPlayedCount: number;
  backlogRatio: number;
  concentration: number;
  nightOwlRatio: number;
  earlyBirdRatio: number;
  topGames: WrappedTopGame[];
  topGame: WrappedTopGame | null;
  archetype: WrappedArchetype;
};
