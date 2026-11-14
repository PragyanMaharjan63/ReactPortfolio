import { Mail, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { site } from "@/data/site";
import { useSeo } from "@/lib/useSeo";

export default function ContactPage() {
  useSeo({
    title: "Contact",
    description: `Get in touch with ${site.name} — robotics and full-stack engineering.`,
    path: "/contact",
  });

  return (
    <div className="section">
      <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch"
          description="Open to robotics and full-stack work. Email is the fastest route."
        />

        <dl className="border-t border-line">
          <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-b border-line py-4">
            <dt className="label flex items-center gap-2 pt-0.5">
              <Mail className="size-3.5" aria-hidden="true" />
              Email
            </dt>
            <dd>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-11 items-center text-secondary transition-colors [overflow-wrap:anywhere] hover:text-primary"
              >
                {site.email}
              </a>
            </dd>
          </div>

          <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-b border-line py-4">
            <dt className="label flex items-center gap-2 pt-0.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              Location
            </dt>
            <dd className="py-2.5 text-secondary">{site.location}</dd>
          </div>

          <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-b border-line py-4">
            <dt className="label pt-0.5">Elsewhere</dt>
            <dd className="flex flex-wrap gap-x-6">
              <ExternalLink
                href={site.github}
                className="min-h-11 text-secondary hover:text-primary"
              >
                GitHub
              </ExternalLink>
              <ExternalLink
                href={site.linkedin}
                className="min-h-11 text-secondary hover:text-primary"
              >
                LinkedIn
              </ExternalLink>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
