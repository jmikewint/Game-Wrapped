const FAQS = [
  {
    q: "Is GameWrapped affiliated with Valve or Steam?",
    a: "No. GameWrapped is an independent fan project that uses Steam's public Web API. It isn't affiliated with, endorsed by, or sponsored by Valve.",
  },
  {
    q: "Do you store my Steam password?",
    a: "No. Sign-in uses Steam OpenID, so your credentials are entered on Steam's own site and GameWrapped never sees them.",
  },
  {
    q: "Does my Steam profile need to be public?",
    a: "Your game details and playtime need to be visible to the public (or at least to your friends list) for GameWrapped to read them. Private profiles won't return data.",
  },
  {
    q: "Is Steam sign-in live yet?",
    a: "Not yet — this release is the front-end foundation. Authentication and live data are the next milestone.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-6xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-coral">
        FAQ
      </p>
      <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold text-ink-text sm:text-4xl">
        Good to know
      </h2>

      <dl className="mt-12 divide-y divide-line border-y border-line">
        {FAQS.map((item) => (
          <div key={item.q} className="grid gap-2 py-6 sm:grid-cols-3 sm:gap-8">
            <dt className="font-display text-base font-medium text-ink-text sm:col-span-1">
              {item.q}
            </dt>
            <dd className="font-body text-sm leading-relaxed text-muted sm:col-span-2">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
