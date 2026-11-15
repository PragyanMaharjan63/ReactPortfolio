import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

/** Arrow that swaps for a second copy on hover (the host needs .btn, .text-link or .arrow-host). */
export function ArrowSwap({ className }: { className?: string }) {
  return (
    <span className={cn("arrow-swap", className)} aria-hidden="true">
      <ArrowUpRight strokeWidth={1.75} />
      <ArrowUpRight strokeWidth={1.75} />
    </span>
  );
}

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
  arrow = false,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
  external?: boolean;
  arrow?: boolean;
}) {
  const classes = cn("btn", variantClass[variant], className);
  const content = (
    <>
      <span>{children}</span>
      {arrow && <ArrowSwap />}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

/** Underlined text action. Renders an internal Link, or an external anchor with the right attributes. */
export function TextLink({
  href,
  children,
  external = false,
  className,
  icon,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
  icon?: ReactNode;
}) {
  const content = (
    <>
      {icon}
      <span className="text-link-label">{children}</span>
      <ArrowSwap />
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn("text-link", className)}>
        {content}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cn("text-link", className)}>
      {content}
    </Link>
  );
}
