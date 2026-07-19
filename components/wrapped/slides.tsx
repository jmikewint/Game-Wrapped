import Link from "next/link";
import CountUp from "@/components/wrapped/CountUp";
import { ClockIcon, FlameIcon, TagIcon, TrophyIcon } from "@/components/ui/icons";
import type {
  WrappedArchetype,
  WrappedStats,
  WrappedTopGame,
  WrappedTopGenre,
} from "@/types/wrapped";

const eyebrow =
  "font-mono text-xs uppercase tracking-[0.3em] text-white/50";

export function IntroSlide({
  displayName,
  avatarUrl,
  gameCount,
  year,
}: {
  displayName: string;
  avatarUrl: string | null;
  gameCount: number;
  year: number;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-8 text-center">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Steam avatar URLs are dynamic per-user
        <img
          src={avatarUrl}
          alt=""
          className="animate-fan-in h-20 w-20 rounded-full border-2 border-white/30 shadow-lg"
        />
      ) : null}
      <p className={eyebrow}>Your {year} year, wrapped</p>
      <h1 className="animate-fan-in font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
        Hey {displayName},
        <br />
        let&apos;s see your year.
      </h1>
      <p className="max-w-xs font-body text-white/70">
        {gameCount} games in your library are about to tell a story.
      </p>
      <p className="mt-4 font-mono text-xs text-white/40">Tap to begin →</p>
    </div>
  );
}

export function TotalHoursSlide({
  totalHours,
  gameCount,
  isEstimated,
}: {
  totalHours: number;
  gameCount: number;
  isEstimated: boolean;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
      <ClockIcon className="h-8 w-8 text-white/60" />
      <p className={eyebrow}>Total time played</p>
      <p className="font-display text-7xl font-bold text-white sm:text-8xl">
        <CountUp value={totalHours} />
      </p>
      <p className="font-body text-lg text-white/70">hours this year</p>
      <p className="mt-3 max-w-xs font-body text-sm text-white/50">
        Spread across {gameCount} game{gameCount === 1 ? "" : "s"} in your
        library.
      </p>
      {isEstimated ? (
        <p className="mt-1 max-w-xs font-mono text-[11px] text-white/35">
          First recap on GameWrapped — showing lifetime totals until we&apos;ve
          tracked a full year.
        </p>
      ) : null}
    </div>
  );
}

export function TopGameSlide({ topGame }: { topGame: WrappedTopGame }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-8 text-center">
      {topGame.headerImage ? (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- Steam CDN header art, not worth a remote-image config entry */}
          <img
            src={topGame.headerImage}
            alt=""
            className="h-full w-full scale-110 object-cover opacity-30 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
        </div>
      ) : null}
      <div className="relative flex flex-col items-center gap-4">
        <FlameIcon className="h-8 w-8 text-white/70" />
        <p className={eyebrow}>Your most played game</p>
        <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
          {topGame.name}
        </h2>
        <p className="font-body text-lg text-white/80">
          <CountUp value={topGame.hours} /> hours logged
        </p>
      </div>
    </div>
  );
}

export function TopGamesListSlide({
  topGames,
}: {
  topGames: WrappedTopGame[];
}) {
  const maxHours = Math.max(...topGames.map((g) => g.hours), 1);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-8 text-center">
      <div className="flex items-center gap-2">
        <TrophyIcon className="h-6 w-6 text-white/70" />
        <p className={eyebrow}>Your top {topGames.length}</p>
      </div>
      <ul className="flex w-full max-w-sm flex-col gap-4">
        {topGames.map((game, i) => (
          <li
            key={game.id}
            className="animate-fan-in flex items-center gap-3 text-left"
            style={{ animationDelay: `${i * 160}ms` }}
          >
            <span className="w-5 shrink-0 font-mono text-sm text-white/40">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-display text-sm font-medium text-white sm:text-base">
                  {game.name}
                </span>
                <span className="shrink-0 font-mono text-xs text-white/50">
                  {game.hours}h
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white/80"
                  style={{ width: `${(game.hours / maxHours) * 100}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AchievementsSlide({
  achievementsThisYear,
  achievementsAllTime,
  trackedGameCount,
}: {
  achievementsThisYear: number;
  achievementsAllTime: number;
  trackedGameCount: number;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
      <TrophyIcon className="h-8 w-8 text-white/60" />
      <p className={eyebrow}>Achievements this year</p>
      <p className="font-display text-7xl font-bold text-white sm:text-8xl">
        <CountUp value={achievementsThisYear} />
      </p>
      <p className="font-body text-lg text-white/70">
        unlocked in {trackedGameCount} game{trackedGameCount === 1 ? "" : "s"}
      </p>
      <p className="mt-3 max-w-xs font-body text-sm text-white/50">
        {achievementsAllTime.toLocaleString()} total, all-time, across your
        most-played games.
      </p>
    </div>
  );
}

export function GenreSlide({ topGenre }: { topGenre: WrappedTopGenre }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
      <TagIcon className="h-8 w-8 text-white/60" />
      <p className={eyebrow}>Your most-played genre</p>
      <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
        {topGenre.name}
      </h2>
      <p className="font-body text-lg text-white/80">
        <CountUp value={topGenre.hours} /> hours across {topGenre.gameCount}{" "}
        game{topGenre.gameCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function ArchetypeSlide({
  archetype,
}: {
  archetype: WrappedArchetype;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-8 text-center">
      <p className={eyebrow}>Your gaming personality</p>
      <span className="animate-fan-in text-6xl">{archetype.emoji}</span>
      <h2 className="animate-fan-in font-display text-3xl font-bold text-white sm:text-4xl">
        {archetype.title}
      </h2>
      <p className="max-w-sm font-body text-white/70">{archetype.tagline}</p>
    </div>
  );
}

/** Builds the query string for the downloadable OG-image recap card at
 * `/api/wrapped/card`, using the exact same numbers the viewer just saw
 * (rather than recomputing on the server, which would need to guess at
 * timezone-dependent bits like the archetype). */
function buildCardUrl(displayName: string, stats: WrappedStats): string {
  const params = new URLSearchParams({
    name: displayName,
    year: String(stats.year),
    hours: String(stats.totalHours),
    games: String(stats.gameCount),
    archTitle: stats.archetype.title,
    archEmoji: stats.archetype.emoji,
  });
  if (stats.topGame) {
    params.set("topGame", stats.topGame.name);
    params.set("topGameHours", String(stats.topGame.hours));
  }
  if (stats.topGenre) {
    params.set("topGenre", stats.topGenre.name);
  }
  if (stats.achievementsThisYear > 0) {
    params.set("achievements", String(stats.achievementsThisYear));
  }
  return `/api/wrapped/card?${params.toString()}`;
}

export function OutroSlide({
  displayName,
  stats,
  onReplay,
}: {
  displayName: string;
  stats: WrappedStats;
  onReplay: () => void;
}) {
  const cardUrl = buildCardUrl(displayName, stats);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-8 text-center">
      <p className={eyebrow}>
        {displayName}&apos;s {stats.year} year, wrapped
      </p>
      <div className="w-full max-w-xs rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
        <p className="font-display text-2xl font-bold text-white">
          {stats.archetype.emoji} {stats.archetype.title}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Hours
            </p>
            <p className="font-display text-xl font-semibold text-white">
              {stats.totalHours.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Games
            </p>
            <p className="font-display text-xl font-semibold text-white">
              {stats.gameCount}
            </p>
          </div>
          {stats.topGame ? (
            <div className="col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                Most played
              </p>
              <p className="font-display text-base font-semibold text-white">
                {stats.topGame.name}
              </p>
            </div>
          ) : null}
          {stats.topGenre ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                Top genre
              </p>
              <p className="font-display text-base font-semibold text-white">
                {stats.topGenre.name}
              </p>
            </div>
          ) : null}
          {stats.achievementsThisYear > 0 ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                Achievements
              </p>
              <p className="font-display text-base font-semibold text-white">
                {stats.achievementsThisYear}
              </p>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={onReplay}
          className="font-body text-sm font-medium text-white/70 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
        >
          Watch again
        </button>
        <a
          href={cardUrl}
          download={`gamewrapped-${stats.year}.png`}
          className="rounded-full border border-white/25 bg-white/10 px-6 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          Download image
        </a>
        <Link
          href="/"
          className="rounded-full bg-white px-6 py-2.5 font-display text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
        >
          Back to GameWrapped
        </Link>
      </div>
    </div>
  );
}
