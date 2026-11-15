export default function Loading() {
  return (
    <div className="shell min-h-[65vh] pt-[calc(var(--header-height)+5rem)]" role="status" aria-live="polite">
      <p className="label flex items-center gap-3"><span className="status-dot status-dot-live" /> Loading the next chapter</p>
      <div className="mt-10 h-px w-full origin-left animate-pulse bg-accent/50" />
    </div>
  );
}
