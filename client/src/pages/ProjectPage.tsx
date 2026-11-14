import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import { GitHubIcon } from "@/components/ui/icons";
import { getProject } from "@/data/projects";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { ProjectMetadata } from "@/components/projects/ProjectMetadata";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { VideoPlayer } from "@/components/projects/VideoPlayer";
import { RobotViewerLazy } from "@/components/three/RobotViewerLazy";
import { useSeo } from "@/lib/useSeo";
import { site } from "@/data/site";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProject(slug) : undefined;

  useSeo({
    title: project ? project.title : "Not found",
    description: project?.summary ?? site.description,
    path: `/projects/${slug ?? ""}`,
  });

  if (!project) {
    return (
      <div className="section">
        <div className="shell">
          <h1 className="text-h2 text-primary">Not found</h1>
          <Link
            to="/work"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-accent"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All work
          </Link>
        </div>
      </div>
    );
  }

  const isRobotics = project.domain === "robotics";

  return (
    <article className="section">
      <div className="shell">
        <Link
          to="/work"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All work
        </Link>

        <header className="mt-6 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{project.category}</Badge>
              <span className="label">{project.year}</span>
            </div>
            <h1 className="mt-4 text-display text-primary">{project.title}</h1>
            <p className="mt-3 max-w-xl text-lead text-secondary">
              {project.summary}
            </p>
          </div>

          {(project.links.live || project.links.github) && (
            <div className="flex flex-wrap gap-3">
              {project.links.live && (
                <ExternalLink href={project.links.live} className="btn btn-primary">
                  <Globe className="size-4" aria-hidden="true" />
                  Visit
                </ExternalLink>
              )}
              {project.links.github && (
                <ExternalLink
                  href={project.links.github}
                  className="btn btn-secondary"
                >
                  <GitHubIcon className="size-4" aria-hidden="true" />
                  Source
                </ExternalLink>
              )}
            </div>
          )}
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="space-y-10">
            <p className="text-lead text-secondary">{project.description}</p>

            {isRobotics && (
              <section aria-labelledby="model-heading">
                <h2 id="model-heading" className="label border-b border-line pb-3">
                  3D
                </h2>
                <div className="mt-5">
                  <RobotViewerLazy
                    rig={project.slug === "quadruped" ? "quadruped" : "yetibot"}
                    modelUrl={project.model}
                    modelType={project.modelType}
                    poster={project.image ?? "/media/yetibot/face.jpg"}
                    posterAlt={project.imageAlt ?? project.title}
                    simulate
                    description={
                      project.slug === "quadruped"
                        ? "Drag to rotate · scroll to zoom · pick a gait to walk it"
                        : "Drag to rotate · scroll to zoom · tap the top of the head"
                    }
                  />
                </div>
              </section>
            )}

            {project.videos && project.videos.length > 0 && (
              <section aria-labelledby="demo-heading">
                <h2 id="demo-heading" className="label border-b border-line pb-3">
                  Demo
                </h2>
                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  {project.videos.map((v) => (
                    <VideoPlayer key={v.src} {...v} />
                  ))}
                </div>
              </section>
            )}

            {project.challenges && project.challenges.length > 0 && (
              <section aria-labelledby="challenges-heading">
                <h2
                  id="challenges-heading"
                  className="label border-b border-line pb-3"
                >
                  Hard parts
                </h2>
                <ul className="mt-5 space-y-3">
                  {project.challenges.map((c) => (
                    <li key={c} className="flex gap-3 text-secondary">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-px w-4 shrink-0 bg-accent/60"
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {project.gallery && project.gallery.length > 0 && (
              <section aria-labelledby="gallery-heading">
                <h2 id="gallery-heading" className="label border-b border-line pb-3">
                  Gallery
                </h2>
                <div className="mt-5">
                  <ProjectGallery items={project.gallery} />
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8">
            {project.metadata && project.metadata.length > 0 && (
              <section aria-labelledby="specs-heading">
                <h2 id="specs-heading" className="label mb-4">
                  Spec
                </h2>
                <ProjectMetadata rows={project.metadata} />
              </section>
            )}

            {project.technologies.length > 0 && (
              <section aria-labelledby="stack-heading">
                <h2 id="stack-heading" className="label mb-4">
                  Stack
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <li key={t}>
                      <Badge>{t}</Badge>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Gaps stay visible rather than being quietly omitted. */}
            {project.missingInfo && project.missingInfo.length > 0 && (
              <section aria-labelledby="missing-heading" className="panel p-5">
                <h2 id="missing-heading" className="label">
                  Undocumented
                </h2>
                <ul className="mt-3 space-y-2">
                  {project.missingInfo.map((m) => (
                    <li key={m} className="text-sm text-muted">
                      {m}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}
