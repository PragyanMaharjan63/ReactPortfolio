import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * External anchor with the security attributes and an accessible hint that the
 * link opens a new tab. Never render a bare <a target="_blank"> elsewhere.
 */
export function ExternalLink({
  href,
  children,
  className,
  showIcon = true,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("group inline-flex items-center gap-1.5", className)}
    >
      {children}
      {showIcon && (
        <ArrowUpRight
          className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      )}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
