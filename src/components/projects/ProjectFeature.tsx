import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/Image";
import type { Project } from "@/data/projects";
import { pad } from "@/lib/utils";

export function ProjectFeature({ project, index, priority = false }: { project: Project; index: number; priority?: boolean }) {
  return (
    <article className={`project-feature ${index === 2 ? "project-feature-wide" : ""}`}>
      <div className="project-feature-caption"><span className="label">{pad(index + 1)} <span className="mx-2">/</span> {project.category}</span><span className="label">{project.year}</span></div>
      <Link href={`/projects/${project.slug}`} className={`project-feature-media ${project.domain === "robotics" ? "project-media-object" : "project-media-web"}`} aria-label={`Explore ${project.title}`}>
        {project.image ? <Image src={project.image} alt={project.imageAlt ?? project.title} fill sizes={index === 2 ? "(max-width: 768px) 100vw, 1280px" : "(max-width: 768px) 100vw, 660px"} priority={priority} className={project.domain === "robotics" ? "project-image object-contain p-10" : "project-image object-cover object-center"} /> : <span className="label">Project overview</span>}
        <span className="project-open" aria-hidden="true"><ArrowUpRight /></span>
      </Link>
      <div className="project-feature-info"><div><h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.summary}</p></div><Link href={`/projects/${project.slug}`} className="text-link shrink-0">View project <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link></div>
      <div className="project-feature-meta"><span>{project.technologies.slice(0, 4).join(" / ")}</span><span>{project.role}</span></div>
    </article>
  );
}
