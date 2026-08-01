import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSeo } from "@/lib/useSeo";

export default function NotFoundPage() {
  useSeo({
    title: "Page not found",
    description: "That page does not exist.",
    path: "/404",
  });

  return (
    <div className="section">
      <div className="shell">
        <p className="label">404</p>
        <h1 className="mt-4 text-h2 text-primary">Page not found</h1>
        <p className="mt-4 max-w-md text-secondary">
          That address does not match anything on this site.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-11 items-center gap-2 text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
