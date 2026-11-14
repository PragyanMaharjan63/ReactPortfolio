import { useId } from "react";

/** A static SVG texture, inspired by Magic UI's dot-pattern composition. */
export function DotPattern({ className }: { className?: string }) {
  const id = useId().replaceAll(":", "");
  return (
    <svg aria-hidden="true" className={className} width="100%" height="100%">
      <defs><pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="currentColor" /></pattern></defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
