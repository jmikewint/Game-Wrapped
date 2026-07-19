import type { AnchorHTMLAttributes, ReactNode } from "react";
import {
  buttonBaseClasses,
  buttonVariantClasses,
  type ButtonVariant,
} from "@/lib/button-styles";

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export default function LinkButton({
  variant = "primary",
  icon,
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <a
      className={`${buttonBaseClasses} ${buttonVariantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </a>
  );
}
