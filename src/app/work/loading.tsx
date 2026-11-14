export default function Loading() {
  return (
    <div className="shell section min-h-[65vh]" role="status" aria-live="polite">
      <p className="label flex items-center gap-3"><span className="status-dot" /> Loading the next chapter</p>
      <div className="mt-10 h-px w-full origin-left animate-pulse bg-accent/40" />
    </div>
  );
}
