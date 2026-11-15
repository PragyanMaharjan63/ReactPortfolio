import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="section relative min-h-svh overflow-hidden pt-[calc(var(--header-height)+5rem)]" data-theme="dark">
      <div className="shell relative z-[1]">
        <p className="label">Error / 404</p>
        <h1 className="mt-6 text-display">Page not found</h1>
        <p className="mt-6 max-w-md text-lead text-secondary">
          That address does not match anything on this site.
        </p>
        <Link href="/" className="btn btn-primary mt-10">
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Back to home</span>
        </Link>
      </div>
    </div>
  );
}
