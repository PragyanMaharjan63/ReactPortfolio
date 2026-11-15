import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/Image";
import { DotPattern } from "@/components/ui/DotPattern";
import { Parallax } from "@/components/ui/Parallax";
import type { Project } from "@/data/projects";
import { cn, pad } from "@/lib/utils";

export type FeatureLayout = "a" | "b" | "wide";

/** Three at-a-glance facts: verified metadata when a project has it, otherwise stack / role / status. */
function quickFacts(project: Project): { label: string; value: string }[] {
  if (project.metadata && project.metadata.length > 0) return project.metadata.slice(0, 3);
  const facts = [
    { label: "Stack", value: project.technologies.slice(0, 3).join(" / ") },
    { label: "Role", value: project.role },
    ...(project.status ? [{ label: "Status", value: project.status }] : []),
  ];
  return facts.filter((fact) => fact.value);
}

/** Bento tile for the home page: index, media, title, spec line. The whole tile is the link. */
export function ProjectFeature({
  project,
  index,
  layout,
  dark = false,
  priority = false,
}: {
  project: Project;
  index: number;
  layout: FeatureLayout;
  dark?: boolean;
  priority?: boolean;
}) {
  const robotics = project.domain === "robotics";
  const href = `/projects/${project.slug}`;

  const head = (
    <div className="tile-head">
      <span className="label">
        <span className="label-strong">{pad(index + 1)}</span> / {project.category}
      </span>
      <span className="label">{project.year}</span>
    </div>
  );

  const media = (
    <div className={cn("tile-media", robotics && "tile-media-contain")}>
      <DotPattern className="dot-field" />
      {project.image ? (
        <Parallax className="absolute inset-0" amount={robotics ? 3 : 5}>
          <Image
            src={project.image}
            alt={project.imageAlt ?? project.title}
            fill
            sizes={layout === "wide" ? "(max-width: 768px) 100vw, 800px" : layout === "a" ? "(max-width: 768px) 100vw, 780px" : "(max-width: 768px) 100vw, 560px"}
            priority={priority}
            className={cn("project-image", robotics ? "object-contain p-6" : "object-cover object-center")}
          />
        </Parallax>
      ) : (
        <span className="label absolute inset-0 grid place-items-center">Project overview</span>
      )}
    </div>
  );

  const body = (
    <div className="tile-body">
      <h3>
        <Link href={href} className="tile-link" aria-label={`Explore ${project.title}`}>
          {project.title}
        </Link>
      </h3>
      <p>{project.summary}</p>
      <span className="tile-go" aria-hidden="true">
        <ArrowUpRight className="size-5" strokeWidth={1.5} />
      </span>
    </div>
  );

  const specs = (
    <dl className="tile-specs">
      {quickFacts(project).map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className="label">{fact.label}</dt>
          <dd className="mt-1 text-sm">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );

  if (layout === "wide") {
    return (
      <article className="tile tile-wide tile-raised" data-cursor="View" data-theme={dark ? "dark" : undefined}>
        <div className="flex min-w-0 flex-col">
          {head}
          {media}
        </div>
        <div className="tile-wide-copy">
          <div className="pt-6 lg:pt-12">{body}</div>
          {specs}
        </div>
      </article>
    );
  }

  return (
    <article className={cn("tile", layout === "a" ? "tile-a" : "tile-b")} data-cursor="View" data-theme={dark ? "dark" : undefined}>
      {head}
      {media}
      {body}
      {specs}
    </article>
  );
}
