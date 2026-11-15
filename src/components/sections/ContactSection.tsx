import Link from "next/link";
import { ArrowSwap } from "@/components/ui/Button";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { RevealLines } from "@/components/ui/RevealLines";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { site } from "@/data/site";

export function ContactSection({ standalone = false }: { standalone?: boolean }) {
  return (
    <section
      id="contact"
      data-theme="dark"
      className={`section contact ${standalone ? "pt-[calc(var(--header-height)+clamp(3rem,7vw,6rem))]" : ""}`}
      aria-labelledby="contact-heading"
    >
      <div className="guides" aria-hidden="true" />
      <div className="shell">
        <div className="section-heading-label relative z-[1]">
          <ScrambleText className="label text-accent" text="05" />
          <span className="label">{standalone ? "Contact" : "Start a conversation"}</span>
        </div>

        <div className="contact-grid">
          <RevealLines
            as={standalone ? "h1" : "h2"}
            id="contact-heading"
            className="contact-title"
            lines={standalone ? ["Get in", "touch"] : ["Let’s", "talk."]}
          />
          <div className="contact-side">
            <Reveal delay={0.2}>
              <p>
                {standalone
                  ? "Open to robotics and full-stack work. Email is the fastest route."
                  : "Have a project in mind? I’d like to hear about it."}
              </p>
            </Reveal>
            {!standalone && (
              <Reveal delay={0.3}>
                <Magnetic>
                  <Link href="/contact" className="contact-cta arrow-host" aria-label="Get in touch">
                    <span className="contact-orb">
                      <ArrowSwap />
                    </span>
                    <span className="text-link-label text-sm font-medium" aria-hidden="true">Get in touch</span>
                  </Link>
                </Magnetic>
              </Reveal>
            )}
          </div>
        </div>

        <Reveal>
          <a href={`mailto:${site.email}`} className="contact-email arrow-host">
            <span className="contact-email-row">
              <span>{site.email}</span>
              <ArrowSwap />
            </span>
          </a>
        </Reveal>

        <dl className="contact-meta">
          <div>
            <dt className="label">Location</dt>
            <dd className="mt-2 text-secondary">{site.location}</dd>
          </div>
          <div>
            <dt className="label">Elsewhere</dt>
            <dd className="mt-2 flex flex-wrap gap-x-6">
              <ExternalLink href={site.github} className="min-h-11 text-secondary hover:text-primary">GitHub</ExternalLink>
              <ExternalLink href={site.linkedin} className="min-h-11 text-secondary hover:text-primary">LinkedIn</ExternalLink>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
