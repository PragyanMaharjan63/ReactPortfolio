import Link from "next/link";
import { Image } from "@/components/ui/Image";
import { ArrowSwap } from "@/components/ui/Button";
import type { Project } from "@/data/projects";

/** Robotics entry on /work: the render stands free, with just a name underneath. */
export function ProjectCard({ project }: { project: Project; index?: number }) {
  const href = `/projects/${project.slug}`;
  return (
    <article className="group">
      <Link href={href} className="relative block aspect-[4/3]" aria-label={`Explore ${project.title}`}>
        {project.image ? (
          <Image
            src={project.image}
            alt={project.imageAlt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-contain transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        ) : (
          <span className="label absolute inset-0 grid place-items-center">No image supplied</span>
        )}
      </Link>
      <Link href={href} className="arrow-host mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
        <h3 className="text-h3 text-primary">{project.title}</h3>
        <span className="flex items-center gap-3 text-secondary">
          <span className="label">{project.year}</span>
          <ArrowSwap />
        </span>
      </Link>
    </article>
  );
}
