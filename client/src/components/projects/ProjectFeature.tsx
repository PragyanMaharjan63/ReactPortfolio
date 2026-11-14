import { Link } from "react-router-dom";
import { Image } from "@/components/ui/Image";
import { ArrowRight, Globe } from "lucide-react";
import { GitHubIcon } from "@/components/ui/icons";
import type { Project } from "@/data/projects";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { pad } from "@/lib/utils";

/**
 * Large editorial layout for a featured project. Alternates image side so a
 * run of features does not read as a grid of identical cards.
 */
export function ProjectFeature({
  project,
  index,
  priority = false,
}: {
  project: Project;
  index: number;
  priority?: boolean;
}) {
  const flipped = index % 2 === 1;

  return (
    <article className="grid items-center gap-8 border-t border-line py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
      <div className={flipped ? "lg:order-2" : undefined}>
        {project.image ? (
          <div className="panel relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={project.image}
              alt={project.imageAlt ?? ""}
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              priority={priority}
              className="object-cover object-top"
            />
          </div>
        ) : (
          <div className="panel flex aspect-[4/3] w-full items-center justify-center">
            <span className="label">Awaiting project media</span>
          </div>
        )}
      </div>

      <div className={flipped ? "lg:order-1" : undefined}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="label">{pad(index + 1)}</span>
          <Badge>{project.category}</Badge>
          <span className="label">{project.year}</span>
        </div>

        <h3 className="mt-4 text-h2 text-primary">{project.title}</h3>
        <p className="mt-4 max-w-xl text-lead text-secondary">{project.summary}</p>

        {project.technologies.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {project.technologies.slice(0, 6).map((tech) => (
              <li key={tech}>
                <Badge>{tech}</Badge>
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="label w-16 shrink-0 pt-0.5">Role</dt>
            <dd className="text-secondary">{project.role}</dd>
          </div>
          {project.status && (
            <div className="flex gap-3">
              <dt className="label w-16 shrink-0 pt-0.5">Status</dt>
              <dd className="text-secondary">{project.status}</dd>
            </div>
          )}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            to={`/projects/${project.slug}`}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent"
          >
            Read case study
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          {project.links.live && (
            <ExternalLink
              href={project.links.live}
              className="min-h-11 text-sm text-secondary hover:text-primary"
            >
              <Globe className="size-4" aria-hidden="true" />
              Live site
            </ExternalLink>
          )}
          {project.links.github && (
            <ExternalLink
              href={project.links.github}
              className="min-h-11 text-sm text-secondary hover:text-primary"
            >
              <GitHubIcon className="size-4" aria-hidden="true" />
              Source
            </ExternalLink>
          )}
        </div>
      </div>
    </article>
  );
}
