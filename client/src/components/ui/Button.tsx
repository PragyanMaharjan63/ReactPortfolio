import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: { variant?: Variant; children: ReactNode } & ComponentPropsWithoutRef<"button">) {
  return (
    <button className={cn("btn", variantClass[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
  external = false,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  const classes = cn("btn", variantClass[variant], className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link to={href} className={classes}>
      {children}
    </Link>
  );
}
