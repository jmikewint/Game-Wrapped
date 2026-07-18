import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-volt text-ink hover:bg-volt-dim focus-visible:outline-volt shadow-[0_0_0_1px_rgba(198,255,61,0.4)]",
  secondary:
    "bg-panel-raised text-ink-text border border-line hover:border-ice/60 hover:text-ice focus-visible:outline-ice",
  ghost:
    "bg-transparent text-ink-text hover:bg-panel-raised focus-visible:outline-muted",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export default function Button({
  variant = "primary",
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-sm font-semibold tracking-wide transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
