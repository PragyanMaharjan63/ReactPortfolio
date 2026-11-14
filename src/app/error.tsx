"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="shell section min-h-[65vh]">
      <p className="label">A small interruption</p>
      <h1 className="mt-5 text-h2">Something went wrong.</h1>
      <p className="mt-4 text-secondary">Please try loading this page again.</p>
      <button type="button" className="btn btn-primary mt-8" onClick={reset}>Try again</button>
    </div>
  );
}
