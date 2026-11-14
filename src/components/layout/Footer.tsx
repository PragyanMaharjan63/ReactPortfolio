import Link from "next/link";
import { site } from "@/data/site";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function Footer() {
  return (
    <footer className="site-footer border-t border-line">
      <div className="shell footer-grid">
        <div><p className="footer-name">{site.name}</p><p className="mt-2 text-xs text-secondary">Robotics, software, and the space in between.</p></div>
        <nav aria-label="Footer" className="footer-links"><ExternalLink href={site.github}>GitHub</ExternalLink><ExternalLink href={site.linkedin}>LinkedIn</ExternalLink><a href={`mailto:${site.email}`}>Email</a><Link href="/work">All work</Link></nav>
      </div>
      <div className="shell footer-bottom"><p>© {new Date().getFullYear()} {site.name}</p><p>Made in Lalitpur, Nepal.</p><a href="#main" className="text-link">Back to top ↑</a></div>
    </footer>
  );
}
