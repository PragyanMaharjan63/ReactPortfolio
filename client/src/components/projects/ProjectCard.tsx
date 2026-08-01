import { Link } from "react-router-dom";
import { Image } from "@/components/ui/Image";
import { ArrowRight, Play } from "lucide-react";
import type { Project } from "@/data/projects";
import { Badge } from "@/components/ui/Badge";

/** Compact listing card used on /work. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="panel group flex h-full flex-col overflow-hidden transition-colors hover:border-line-strong">
      {project.image ? (
        <div className="relative aspect-[16/10] w-full bg-surface-raised">
          <Image
            src={project.image}
            alt={project.imageAlt ?? ""}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover object-top"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center bg-surface-raised">
          <span className="label">No image supplied</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Badge>{project.category}</Badge>
          <span className="label">{project.year}</span>
        </div>

        <h3 className="mt-3 text-h3 text-primary">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm text-secondary">{project.summary}</p>

        {/* The robots are the thing worth clicking: their page runs the real
            firmware, so the call to action says so and is styled to be the one
            obvious next step. "Case study" undersold it. */}
        {project.model ? (
          <Link
            to={`/projects/${project.slug}`}
            className="btn btn-primary mt-5 w-full"
          >
            <Play className="size-4" aria-hidden="true" />
            See the simulation
          </Link>
        ) : (
          <Link
            to={`/projects/${project.slug}`}
            className="btn btn-secondary mt-5 w-full"
          >
            Case study
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </article>
  );
}
