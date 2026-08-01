import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { roboticsProjects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectMetadata } from "@/components/projects/ProjectMetadata";

export function RoboticsSection() {
  return (
    <section
      id="robotics"
      className="section border-t border-line"
      aria-labelledby="robotics-heading"
    >
      <div className="shell">
        <SectionHeading id="robotics-heading" eyebrow="Lab" title="Robotics" />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {roboticsProjects.map((project) => (
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
                to={`/projects/${project.slug}`}
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
