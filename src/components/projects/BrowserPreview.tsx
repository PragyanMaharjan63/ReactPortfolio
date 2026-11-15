import { Image } from "@/components/ui/Image";
import { cn } from "@/lib/utils";

/**
 * Screenshot in a minimal address-bar frame. Deliberately a static image that
 * opens the real site in a new tab — an iframe per project would be slow and
 * many sites refuse framing anyway.
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
    <div className={cn("web-shot", className)}>
      <div className="web-shot-bar">
        <span className="label truncate">{url ? url.replace(/^https?:\/\//, "").replace(/\/$/, "") : "Screenshot"}</span>
        <span className="label shrink-0" aria-hidden="true">{url ? "● Live" : ""}</span>
      </div>
      <div className="web-shot-frame">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 58vw, 780px"
          priority={priority}
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
