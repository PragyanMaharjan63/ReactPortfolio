import { Link } from "react-router-dom";
import { site } from "@/data/site";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-primary">{site.name}</p>
          <p className="mt-1 text-sm text-secondary">{site.role}</p>
          <p className="mt-1 text-sm text-muted">{site.location}</p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <ExternalLink href={site.github} className="text-secondary hover:text-primary">
            GitHub
          </ExternalLink>
          <ExternalLink href={site.linkedin} className="text-secondary hover:text-primary">
            LinkedIn
          </ExternalLink>
          <a
            href={`mailto:${site.email}`}
            className="text-secondary transition-colors hover:text-primary"
          >
            Email
          </a>
          <Link to="/work" className="text-secondary transition-colors hover:text-primary">
            All work
          </Link>
        </nav>
      </div>

      <div className="shell border-t border-line py-6">
        <p className="label">
          © {new Date().getFullYear()} {site.name} · Built with Next.js
        </p>
      </div>
    </footer>
  );
}
