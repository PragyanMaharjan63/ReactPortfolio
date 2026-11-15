import Link from "next/link";
import { site } from "@/data/site";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function Footer() {
  return (
    <footer className="site-footer" data-theme="dark">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <p className="footer-name">{site.name}</p>
            <p className="mt-3 max-w-xs text-secondary">Robotics, software, and the space in between.</p>
          </div>
          <nav aria-label="Footer" className="footer-col">
            <p className="label">Navigate</p>
            <ul>
              <li><Link href="/work">All work</Link></li>
              <li><Link href="/#robotics">Robotics</Link></li>
              <li><Link href="/#web">Web</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </nav>
          <div className="footer-col">
            <p className="label">Elsewhere</p>
            <ul>
              <li><ExternalLink href={site.github}>GitHub</ExternalLink></li>
              <li><ExternalLink href={site.linkedin}>LinkedIn</ExternalLink></li>
              <li><a href={`mailto:${site.email}`}>Email</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <p className="label">Based in</p>
            <p className="mt-4 text-secondary">{site.location}</p>
          </div>
        </div>
        <div className="footer-bottom label">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <p className="hidden sm:block">Made in Lalitpur, Nepal.</p>
          <a href="#main" className="inline-flex min-h-10 items-center transition-colors hover:text-primary">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
