import { Link } from "react-router-dom";
import { ArrowRight, Globe } from "lucide-react";
import { GitHubIcon } from "@/components/ui/icons";
import { webProjects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BrowserPreview } from "@/components/projects/BrowserPreview";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function WebProjectsSection() {
  const withImages = webProjects.filter((p) => p.image);

  return (
    <section
      id="web"
      className="section border-t border-line"
      aria-labelledby="web-heading"
    >
      <div className="shell">
        <SectionHeading id="web-heading" eyebrow="Deployed" title="Web" />

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {withImages.map((project) => (
            <article key={project.slug}>
              <BrowserPreview
                src={project.image as string}
                alt={project.imageAlt ?? ""}
                url={project.links.live}
              />

              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-h3 text-primary">{project.title}</h3>
                <span className="label">{project.year}</span>
              </div>
              <p className="mt-1.5 text-sm text-secondary">{project.summary}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 text-sm">
                {project.links.live && (
                  <ExternalLink
                    href={project.links.live}
                    className="min-h-11 text-secondary hover:text-primary"
                  >
                    <Globe className="size-4" aria-hidden="true" />
                    Live
                  </ExternalLink>
                )}
                {project.links.github && (
                  <ExternalLink
                    href={project.links.github}
                    className="min-h-11 text-secondary hover:text-primary"
                  >
                    <GitHubIcon className="size-4" aria-hidden="true" />
                    Source
                  </ExternalLink>
                )}
                <Link
                  to={`/projects/${project.slug}`}
                  className="inline-flex min-h-11 items-center gap-1.5 text-accent"
                >
                  Open
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
