
import { RotateCcw, Pause, Play } from "lucide-react";

export function ViewerControls({
  playing,
  onToggle,
  onReset,
}: {
  playing: boolean;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="absolute right-3 bottom-3 flex gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? "Pause automatic rotation" : "Resume automatic rotation"}
        className="btn btn-secondary min-h-10 bg-background/70 px-3 backdrop-blur-sm"
      >
        {playing ? (
          <Pause className="size-4" aria-hidden="true" />
        ) : (
          <Play className="size-4" aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset camera view"
        className="btn btn-secondary min-h-10 bg-background/70 px-3 backdrop-blur-sm"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
