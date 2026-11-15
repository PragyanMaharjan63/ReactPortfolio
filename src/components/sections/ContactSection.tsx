import { ArrowSwap } from "@/components/ui/Button";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Reveal } from "@/components/ui/Reveal";
import { RevealLines } from "@/components/ui/RevealLines";
import { site } from "@/data/site";

export function ContactSection({ standalone = false }: { standalone?: boolean }) {
  return (
    <section
      id="contact"
      className={`section contact ${standalone ? "contact-page" : ""}`}
      aria-labelledby="contact-heading"
    >
      <div className="shell">
        {!standalone && <p className="section-tag"><span>05</span>Contact</p>}

        <RevealLines
          as={standalone ? "h1" : "h2"}
          id="contact-heading"
          className="contact-title"
          lines={standalone ? ["Get in", "touch"] : ["Let’s", "talk."]}
          mutedLast
        />

        <Reveal>
          <a href={`mailto:${site.email}`} className="contact-email arrow-host">
            <span>{site.email}</span>
            <ArrowSwap />
          </a>
        </Reveal>

        <div className="contact-meta">
          <span className="label">{site.location}</span>
          <span className="flex gap-6">
            <ExternalLink href={site.github} className="min-h-11 text-secondary hover:text-primary">GitHub</ExternalLink>
            <ExternalLink href={site.linkedin} className="min-h-11 text-secondary hover:text-primary">LinkedIn</ExternalLink>
          </span>
        </div>
      </div>
    </section>
  );
}
