export type ButtonVariant = "primary" | "secondary" | "ghost";

export const buttonBaseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-sm font-semibold tracking-wide transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-volt text-white hover:bg-volt-dim focus-visible:outline-volt shadow-[0_0_0_1px_rgba(151,125,255,0.4)]",
  secondary:
    "bg-panel-raised text-ink-text border border-line hover:border-ice/60 hover:text-ice focus-visible:outline-ice",
  ghost:
    "bg-transparent text-ink-text hover:bg-panel-raised focus-visible:outline-muted",
};
