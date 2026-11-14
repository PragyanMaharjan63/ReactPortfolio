import { cn } from "@/lib/utils";

/**
 * Thin replacement for next/image in a Vite build.
 *
 * `fill` mirrors the Next API (absolutely fills a positioned parent) so the
 * component call sites did not have to change shape. `priority` maps to eager
 * loading plus a high fetch priority for the one above-the-fold image; every
 * other image lazy-loads and decodes off the main thread.
 */
export function Image({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
    />
  );
}
