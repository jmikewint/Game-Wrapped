const STEPS = [
  {
    title: "Sign in with Steam",
    body: "Authenticate with Steam's own login — GameWrapped never sees your password.",
  },
  {
    title: "We read your library",
    body: "Public playtime and achievement data is pulled through the official Steam Web API.",
  },
  {
    title: "Get your recap",
    body: "A shareable page with your top games, total hours, and the year's highlights.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-line/60 bg-panel/40">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-volt">
          How it works
        </p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold text-ink-text sm:text-4xl">
          Three steps between you and your recap
        </h2>

        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <span className="font-display text-sm text-muted/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink-text">
                {step.title}
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
