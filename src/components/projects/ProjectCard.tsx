import Link from "next/link";
import { Image } from "@/components/ui/Image";
import { DotPattern } from "@/components/ui/DotPattern";
import { ButtonLink } from "@/components/ui/Button";
import { ProjectMetadata } from "@/components/projects/ProjectMetadata";
import type { Project } from "@/data/projects";
import { pad } from "@/lib/utils";

/** Large plate for robotics projects on /work: image on a dot-grid plate with a datasheet below. */
export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const href = `/projects/${project.slug}`;
  return (
    <article className="group" data-theme="dark">
      <Link href={href} className="panel ticks relative block aspect-[4/3] overflow-hidden" data-cursor="View" aria-label={`Explore ${project.title}`}>
        <DotPattern className="dot-field" />
        <div className="absolute inset-x-4 top-3.5 z-[2] flex justify-between">
          <span className="label">FIG. {pad(index + 1)}</span>
          <span className="label">{project.year}</span>
        </div>
        {project.image ? (
          <Image
            src={project.image}
            alt={project.imageAlt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-contain p-10 transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        ) : (
          <span className="label absolute inset-0 grid place-items-center">No image supplied</span>
        )}
      </Link>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <h3 className="text-h3 text-primary">{project.title}</h3>
        <span className="label">{project.category}</span>
      </div>
      <p className="mt-2 max-w-md text-secondary">{project.summary}</p>

      {project.metadata && (
        <div className="mt-6">
          <ProjectMetadata rows={project.metadata.slice(0, 4)} />
        </div>
      )}

      <div className="mt-6">
        <ButtonLink href={href} variant={project.model ? "primary" : "secondary"} arrow>
          {project.model ? "See the simulation" : "Case study"}
        </ButtonLink>
      </div>
    </article>
  );
}
