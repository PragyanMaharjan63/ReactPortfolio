import { useRef, useState } from "react";
import { Play } from "lucide-react";

/**
 * Click-to-play video. Nothing is fetched until the poster is clicked
 * (`preload="none"`), so demo footage never competes with first paint.
 * No autoplay, so no muted-autoplay policy games and no surprise audio.
 */
export function VideoPlayer({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    setStarted(true);
    void ref.current?.play();
  };

  return (
    <figure className="m-0">
      <div className="panel relative aspect-[4/3] w-full overflow-hidden bg-black">
        {/* object-contain: the source aspect ratio is unknown, and cropping
            a demo clip loses the thing being demonstrated. */}
        <video
          ref={ref}
          src={src}
          poster={poster}
          preload="none"
          controls={started}
          playsInline
          muted
          loop
          className="h-full w-full object-contain"
          aria-label={label}
        />
        {!started && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex items-center justify-center bg-background/40 transition-colors hover:bg-background/25"
            aria-label={`Play: ${label}`}
          >
            <span className="flex size-14 items-center justify-center rounded-full border border-line-strong bg-background/80">
              <Play className="ml-0.5 size-5" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 text-sm text-muted">{label}</figcaption>
    </figure>
  );
}
