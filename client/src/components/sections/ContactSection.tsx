import { site } from "@/data/site";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="section border-t border-line"
      aria-labelledby="contact-heading"
    >
      <div className="shell flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="label">Contact</p>
          <a
            href={`mailto:${site.email}`}
            className="mt-3 inline-block text-h2 text-primary transition-colors hover:text-accent [overflow-wrap:anywhere]"
          >
            {site.email}
          </a>
        </div>

        <div className="flex gap-x-8 text-sm">
          <ExternalLink href={site.github} className="text-secondary hover:text-primary">
            GitHub
          </ExternalLink>
          <ExternalLink href={site.linkedin} className="text-secondary hover:text-primary">
            LinkedIn
          </ExternalLink>
        </div>
      </div>
    </section>
  );
}
