import { Image } from "@/components/ui/Image";
import { cn } from "@/lib/utils";

/**
 * Screenshot in a browser chrome frame. Deliberately a static image opening
 * the real site in a new tab — an iframe per project would be slow and many
 * sites refuse framing anyway.
 */
export function BrowserPreview({
  src,
  alt,
  url,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  url?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("panel overflow-hidden", className)}>
      <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </span>
        {url && (
          <span className="truncate font-mono text-[0.6875rem] text-muted">
            {url.replace(/^https?:\/\//, "")}
          </span>
        )}
      </div>
      <div className="relative aspect-[4/3] w-full bg-surface-raised">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 620px"
          priority={priority}
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
