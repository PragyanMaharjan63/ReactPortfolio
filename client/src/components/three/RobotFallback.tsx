import { Image } from "@/components/ui/Image";

/**
 * Shown instead of the canvas when WebGL is unavailable, the model fails to
 * load, or the visitor has asked for reduced motion. Always renders real
 * imagery so the section never collapses to an empty box.
 */
export function RobotFallback({
  poster,
  alt,
  reason,
}: {
  poster: string;
  alt: string;
  reason?: string;
}) {
  return (
    <div className="panel relative aspect-square w-full overflow-hidden">
      <Image
        src={poster}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
      {reason && (
        <p className="absolute inset-x-0 bottom-0 bg-background/80 px-4 py-2 text-center text-xs text-secondary backdrop-blur-sm">
          {reason}
        </p>
      )}
    </div>
  );
}
