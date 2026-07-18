export default function Logo() {
  return (
    <a
      href="#top"
      className="group flex items-center gap-2 font-display text-lg font-semibold text-ink-text"
      aria-label="GameWrapped home"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-volt text-ink transition-transform duration-200 group-hover:-rotate-6"
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 18L10 6L14 14L20 6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      Game<span className="text-volt">Wrapped</span>
    </a>
  );
}
