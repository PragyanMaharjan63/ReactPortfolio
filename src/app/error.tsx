"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="section relative min-h-svh pt-[calc(var(--header-height)+5rem)]" data-theme="dark">
      <div className="shell relative z-[1]">
        <p className="label">A small interruption</p>
        <h1 className="mt-6 text-display">Something went wrong.</h1>
        <p className="mt-6 text-lead text-secondary">Please try loading this page again.</p>
        <button type="button" className="btn btn-primary mt-10" onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
