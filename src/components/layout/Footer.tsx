import { site } from "@/data/site";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-row label">
        <p>© {new Date().getFullYear()} {site.name}</p>
        <nav aria-label="Footer" className="footer-links">
          <ExternalLink href={site.github}>GitHub</ExternalLink>
          <ExternalLink href={site.linkedin}>LinkedIn</ExternalLink>
          <a href={`mailto:${site.email}`}>Email</a>
        </nav>
        <a href="#main" className="footer-top">Top ↑</a>
      </div>
    </footer>
  );
}
