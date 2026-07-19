import type { FeaturedGame, StatCard } from "@/types/stats";

const STAT_CARDS: StatCard[] = [
  {
    id: "hours",
    label: "Hours played",
    value: "412",
    detail: "+38% vs. last year",
    accent: "volt",
  },
  {
    id: "games",
    label: "Games launched",
    value: "38",
    detail: "9 played for the first time",
    accent: "ice",
  },
  {
    id: "achievements",
    label: "Achievements",
    value: "214",
    detail: "across 22 games",
    accent: "coral",
  },
  {
    id: "session",
    label: "Longest session",
    value: "6h 40m",
    detail: "Hades II, a Friday night",
    accent: "volt",
  },
];

const FEATURED_GAMES: FeaturedGame[] = [
  { id: "1", name: "Hades II", hours: 96, genre: "Roguelike", rank: 1 },
  { id: "2", name: "Baldur's Gate 3", hours: 74, genre: "RPG", rank: 2 },
  { id: "3", name: "Counter-Strike 2", hours: 61, genre: "Shooter", rank: 3 },
  { id: "4", name: "Factorio", hours: 48, genre: "Simulation", rank: 4 },
];

const accentClasses: Record<StatCard["accent"], string> = {
  volt: "text-volt",
  coral: "text-coral",
  ice: "text-ice",
};

export default function StatsShowcase() {
  const maxHours = Math.max(...FEATURED_GAMES.map((g) => g.hours));

  return (
    <section id="stats" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-14 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-ice">
          Sample recap
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink-text sm:text-4xl">
          A taste of what your wrapped looks like
        </h2>
        <p className="mt-4 font-body text-muted">
          Placeholder data below — this is the layout your real Steam stats
          will drop into once sign-in ships.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl border border-line bg-panel p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-line/0 hover:bg-panel-raised hover:shadow-lg hover:shadow-volt/10"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {card.label}
            </p>
            <p
              className={`mt-3 font-display text-4xl font-semibold ${accentClasses[card.accent]}`}
            >
              {card.value}
            </p>
            <p className="mt-2 font-body text-sm text-muted">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-panel p-6 sm:p-8">
        <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
          Top games by hours
        </p>
        <ul className="flex flex-col gap-4">
          {FEATURED_GAMES.map((game) => (
            <li key={game.id} className="flex items-center gap-4">
              <span className="w-5 shrink-0 font-mono text-sm text-muted">
                {String(game.rank).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-sm font-medium text-ink-text sm:text-base">
                    {game.name}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {game.genre}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-panel-raised">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-ice to-volt"
                    style={{ width: `${(game.hours / maxHours) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-16 shrink-0 text-right font-mono text-sm text-ink-text">
                {game.hours}h
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
