"use client";

import { ClockIcon, FlameIcon, TrophyIcon } from "@/components/ui/icons";

type StackCard = {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  rotation: number;
  accent: string;
  z: number;
};

const cards: StackCard[] = [
  {
    label: "Total playtime",
    value: "412h",
    sub: "across 38 games",
    icon: <ClockIcon className="h-5 w-5" />,
    rotation: -8,
    accent: "var(--color-ice)",
    z: 10,
  },
  {
    label: "Most played",
    value: "Hades II",
    sub: "96 hours logged",
    icon: <FlameIcon className="h-5 w-5" />,
    rotation: 4,
    accent: "var(--color-coral)",
    z: 20,
  },
  {
    label: "Achievements",
    value: "214",
    sub: "unlocked this year",
    icon: <TrophyIcon className="h-5 w-5" />,
    rotation: -2,
    accent: "var(--color-volt)",
    z: 30,
  },
];

export default function RecapCardStack() {
  return (
    <div className="relative mx-auto h-[340px] w-full max-w-xs sm:max-w-sm">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="animate-fan-in absolute inset-x-4 top-6 rounded-2xl border border-line bg-panel p-6 shadow-2xl shadow-black/40 transition-transform duration-300 ease-out hover:-translate-y-2 hover:rotate-0"
          style={
            {
              zIndex: card.z,
              transform: `translateY(${i * 34}px) rotate(${card.rotation}deg)`,
              "--rot-start": `${card.rotation - 6}deg`,
              "--rot-end": `${card.rotation}deg`,
              animationDelay: `${i * 140}ms`,
            } as React.CSSProperties
          }
        >
          <div
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              color: card.accent,
              backgroundColor: `color-mix(in srgb, ${card.accent} 14%, white)`,
            }}
          >
            {card.icon}
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {card.label}
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink-text">
            {card.value}
          </p>
          <p className="mt-1 font-body text-sm text-muted">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
