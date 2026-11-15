import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Globe } from "lucide-react";
import { GitHubIcon } from "@/components/ui/icons";
import type { Project } from "@/data/projects";
import { Badge } from "@/components/ui/Badge";
import { ArrowSwap } from "@/components/ui/Button";
import { DotPattern } from "@/components/ui/DotPattern";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { BrowserPreview } from "@/components/projects/BrowserPreview";
import { ProjectMetadata } from "@/components/projects/ProjectMetadata";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { VideoPlayer } from "@/components/projects/VideoPlayer";
import { RobotViewerLazy } from "@/components/three/RobotViewerLazy";
import { pad } from "@/lib/utils";

function CaseSection({ n, id, title, children }: { n: number; id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <div className="case-section-head">
        <span className="label" aria-hidden="true">{pad(n)}</span>
        <h2 id={id} className="label">{title}</h2>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function ProjectPage({ project, next }: { project: Project; next?: Project }) {
  const isRobotics = project.domain === "robotics";
  let n = 0;

  return (
    <article>
      <header className="case-hero" data-theme="dark">
        <div className="guides" aria-hidden="true" />
        <div
          className="dot-field"
          aria-hidden="true"
          style={{ maskImage: "radial-gradient(ellipse 50% 80% at 85% 40%, #000, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse 50% 80% at 85% 40%, #000, transparent 70%)" }}
        >
          <DotPattern className="size-full" />
        </div>
        <div className="shell">
          <Link href="/work" className="text-link arrow-host">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="text-link-label">All work</span>
          </Link>

          <div className="case-head-row mt-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{project.category}</Badge>
                <span className="label">{project.year}</span>
              </div>
              <RevealText as="h1" className="case-title" text={project.title} />
              <p className="case-lead">{project.summary}</p>
            </div>

            {(project.links.live || project.links.github) && (
              <div className="flex flex-wrap gap-3">
                {project.links.live && (
                  <ExternalLink href={project.links.live} showIcon={false} className="btn btn-primary">
                    <Globe className="size-4" aria-hidden="true" />
                    Visit
                  </ExternalLink>
                )}
                {project.links.github && (
                  <ExternalLink href={project.links.github} showIcon={false} className="btn btn-secondary">
                    <GitHubIcon className="size-4" />
                    Source
                  </ExternalLink>
                )}
              </div>
            )}
          </div>

          <dl className="case-strip">
            <div>
              <dt className="label">Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt className="label">Status</dt>
              <dd>{project.status ?? "—"}</dd>
            </div>
            <div>
              <dt className="label">Year</dt>
              <dd className="tnum">{project.year}</dd>
            </div>
            <div>
              <dt className="label">Discipline</dt>
              <dd>{isRobotics ? "Robotics" : "Web"}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="shell case-body">
        <div className="case-main">
          <Reveal>
            <p className="case-desc">{project.description}</p>
          </Reveal>

          {!isRobotics && project.image && (
            <CaseSection n={++n} id="preview-heading" title="Preview">
              <BrowserPreview src={project.image} alt={project.imageAlt ?? project.title} url={project.links.live} priority />
            </CaseSection>
          )}

          {isRobotics && (
            <CaseSection n={++n} id="model-heading" title="3D">
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
            </CaseSection>
          )}

          {project.videos && project.videos.length > 0 && (
            <CaseSection n={++n} id="demo-heading" title="Demo">
              <div className="grid gap-6 sm:grid-cols-2">
                {project.videos.map((v) => (
                  <VideoPlayer key={v.src} {...v} />
                ))}
              </div>
            </CaseSection>
          )}

          {project.challenges && project.challenges.length > 0 && (
            <CaseSection n={++n} id="challenges-heading" title="Hard parts">
              <ul className="challenge-list border-t border-line">
                {project.challenges.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </CaseSection>
          )}

          {project.gallery && project.gallery.length > 0 && (
            <CaseSection n={++n} id="gallery-heading" title="Gallery">
              <ProjectGallery items={project.gallery} />
            </CaseSection>
          )}
        </div>

        <aside className="case-aside">
          {project.metadata && project.metadata.length > 0 && (
            <section aria-labelledby="specs-heading">
              <h2 id="specs-heading" className="label mb-4 text-primary">Spec</h2>
              <ProjectMetadata rows={project.metadata} />
            </section>
          )}

          {project.technologies.length > 0 && (
            <section aria-labelledby="stack-heading">
              <h2 id="stack-heading" className="label mb-4 text-primary">Stack</h2>
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
            <section aria-labelledby="missing-heading" className="panel ticks p-5">
              <h2 id="missing-heading" className="label text-primary">Undocumented</h2>
              <ul className="mt-3 space-y-2">
                {project.missingInfo.map((m) => (
                  <li key={m} className="text-sm text-secondary">
                    {m}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      {next && (
        <Link href={`/projects/${next.slug}`} className="next-project arrow-host" data-theme="dark" data-cursor="Next">
          <div className="shell next-project-row">
            <div className="min-w-0">
              <p className="label">Next project — {next.category}</p>
              <h2>{next.title}</h2>
            </div>
            <ArrowSwap />
          </div>
        </Link>
      )}
    </article>
  );
}
