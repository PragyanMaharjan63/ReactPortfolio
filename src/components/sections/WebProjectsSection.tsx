import Link from "next/link";
import { Globe } from "lucide-react";
import { GitHubIcon } from "@/components/ui/icons";
import type { Project } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BrowserPreview } from "@/components/projects/BrowserPreview";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/Button";
import { pad } from "@/lib/utils";

export function WebProjectsSection({ projects }: { projects: Project[] }) {
  const withImages = projects.filter((p) => p.image);
  const withoutImages = projects.filter((p) => !p.image);

  return (
    <section id="web" className="section section-tint" aria-labelledby="web-heading">
      <div className="shell">
        <SectionHeading
          id="web-heading"
          eyebrow="03 — Web applications"
          title="On the other side of the screen."
          description="Small tools and full-stack applications, made to be used. Take a look around."
        />

        <div className="web-grid">
          {withImages.map((project, i) => (
            <Reveal key={project.slug} className="web-item" delay={(i % 2) * 0.1}>
              <article>
                <Link href={`/projects/${project.slug}`} data-cursor="Open" aria-label={`Explore ${project.title}`} className="block">
                  <BrowserPreview src={project.image as string} alt={project.imageAlt ?? ""} url={project.links.live} />
                </Link>
                <div className="web-meta">
                  <span className="label tnum pt-2">{pad(i + 1)}</span>
                  <h3>
                    <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                  </h3>
                  <p>{project.summary}</p>
                </div>
                <p className="web-tags">
                  {project.technologies.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </p>
                <div className="web-links text-sm">
                  {project.links.live && (
                    <ExternalLink href={project.links.live} className="min-h-11 text-secondary hover:text-primary">
                      <Globe className="size-4" aria-hidden="true" />
                      Live
                    </ExternalLink>
                  )}
                  {project.links.github && (
                    <ExternalLink href={project.links.github} className="min-h-11 text-secondary hover:text-primary">
                      <GitHubIcon className="size-4" />
                      Source
                    </ExternalLink>
                  )}
                  <TextLink href={`/projects/${project.slug}`} className="!text-accent">Open</TextLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {withoutImages.length > 0 && (
          <Reveal>
            <p className="label mt-[clamp(3rem,6vw,5rem)]">Also deployed</p>
            <ul className="also-list">
              {withoutImages.map((project, i) => (
                <li key={project.slug} className="also-row">
                  <span className="label tnum">{pad(withImages.length + i + 1)}</span>
                  <span className="text-lg font-semibold tracking-tight">{project.title}</span>
                  <span className="text-secondary">{project.summary} <span className="label ml-2">{project.technologies.join(" / ")}</span></span>
                  <TextLink href={`/projects/${project.slug}`}>Open</TextLink>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
}
