import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import type { Project } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectMetadata } from "@/components/projects/ProjectMetadata";

export function RoboticsSection({ projects }: { projects: Project[] }) {
  return (
    <section
      id="robotics"
      className="section border-t border-line"
      aria-labelledby="robotics-heading"
    >
      <div className="shell">
        <SectionHeading id="robotics-heading" eyebrow="02 / The workshop" title="A life beyond the screen." description="Real geometry. Real firmware. Explore the robots in 3D and see what makes them move." />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <article key={project.slug} className="panel flex flex-col p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-h3 text-primary">{project.title}</h3>
                <span className="label">{project.year}</span>
              </div>
              <p className="mt-2 text-secondary">{project.summary}</p>

              {project.metadata && (
                <div className="mt-5">
                  <ProjectMetadata rows={project.metadata} />
                </div>
              )}

              <Link
                href={`/projects/${project.slug}`}
                className={`btn mt-6 self-start ${project.model ? "btn-primary" : "btn-secondary"}`}
              >
                {project.model ? (
                  <>
                    <Play className="size-4" aria-hidden="true" />
                    See the simulation
                  </>
                ) : (
                  <>
                    Open
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
