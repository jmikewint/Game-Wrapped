import CountUp from "@/components/wrapped/CountUp";
import { ClockIcon, FlameIcon, TrophyIcon } from "@/components/ui/icons";
import type { WrappedArchetype, WrappedStats, WrappedTopGame } from "@/types/wrapped";

const eyebrow =
  "font-mono text-xs uppercase tracking-[0.3em] text-white/50";

export function IntroSlide({
  displayName,
  avatarUrl,
  gameCount,
}: {
  displayName: string;
  avatarUrl: string | null;
  gameCount: number;
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
      <p className={eyebrow}>Your year, wrapped</p>
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
}: {
  totalHours: number;
  gameCount: number;
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

export function OutroSlide({
  displayName,
  stats,
  onReplay,
}: {
  displayName: string;
  stats: WrappedStats;
  onReplay: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-8 text-center">
      <p className={eyebrow}>{displayName}&apos;s year, wrapped</p>
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
          href="/"
          className="rounded-full bg-white px-6 py-2.5 font-display text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
        >
          Back to GameWrapped
        </a>
      </div>
    </div>
  );
}
