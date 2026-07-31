export default function ScrollWid({ bar }) {
  // Derived straight from the prop. The previous version mirrored `bar` into
  // state via useEffect, which re-rendered a frame late for no benefit.
  const top = bar === "top" || bar === "both";
  const bottom = bar === "bottom" || bar === "both";

  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-x-6 text-ink-faint select-none"
    >
      {top && <span className="h-px w-14 bg-current" />}
      <span className="text-xs tracking-[0.3em]">SCROLL</span>
      {bottom && <span className="h-px w-14 bg-current" />}
    </div>
  );
}
