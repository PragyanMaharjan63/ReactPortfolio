import { useId } from "react";

/** Static SVG dot grid, after Magic UI's dot-pattern. Colour comes from currentColor. */
export function DotPattern({ className, gap = 22, radius = 0.9 }: { className?: string; gap?: number; radius?: number }) {
  const id = useId().replaceAll(":", "");
  return (
    <svg aria-hidden="true" className={className} width="100%" height="100%">
      <defs>
        <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={radius} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
